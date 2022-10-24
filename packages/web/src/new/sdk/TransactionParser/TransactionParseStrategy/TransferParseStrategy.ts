import { u64 } from '@solana/spl-token';

import type { SolanaSDK, SolanaTokensRepository, TransactionInfo } from 'new/sdk/SolanaSDK';
import { AccountInfo, convertToBalance, SolanaSDKPublicKey, Wallet } from 'new/sdk/SolanaSDK';

import { TransferInfo } from '../model/info/TransferInfo';
import type { ParsedTransactionInfoType } from '../model/ParsedTransaction';
import type { Configuration } from '../TransactionParserService';
import type { TransactionParseStrategy } from './TransactionParseStrategy';

export class TransferParseStrategy implements TransactionParseStrategy {
  private _apiClient: SolanaSDK;
  private _tokensRepository: SolanaTokensRepository;

  constructor({
    apiClient,
    tokensRepository,
  }: {
    apiClient: SolanaSDK;
    tokensRepository: SolanaTokensRepository;
  }) {
    this._apiClient = apiClient;
    this._tokensRepository = tokensRepository;
  }

  isHandlable(transactionInfo: TransactionInfo): boolean {
    const instructions = transactionInfo.transaction.message.instructions;
    return (
      (instructions.length === 1 || instructions.length === 4 || instructions.length === 2) &&
      (instructions.at(-1)?.parsed?.type === 'transfer' ||
        instructions.at(-1)?.parsed?.type === 'transferChecked')
    );
  }

  async parse({
    transactionInfo,
    config,
  }: {
    transactionInfo: TransactionInfo;
    config: Configuration;
  }): Promise<ParsedTransactionInfoType | null> {
    const instructions = transactionInfo.transaction.message.instructions;
    if (instructions.at(-1)?.programId.toString() === SolanaSDKPublicKey.programId.toString()) {
      // SOL to SOL
      return this._parseSOLTransfer({ transactionInfo, config });
    } else {
      // SPL to SPL token
      return this._parseSPLTransfer({ transactionInfo, config });
    }
  }

  private _parseSOLTransfer({
    transactionInfo,
    config,
  }: {
    transactionInfo: TransactionInfo;
    config: Configuration;
  }): TransferInfo | null {
    const instructions = transactionInfo.transaction.message.instructions;

    // get pubkeys
    const transferInstruction = instructions.at(-1);
    const sourcePubkey = transferInstruction?.parsed?.info.source;
    const destinationPubkey = transferInstruction?.parsed?.info.destination;

    // get lamports
    const lamports = new u64(
      transferInstruction?.parsed?.info.lamports ??
        transferInstruction?.parsed?.info.amount ??
        transferInstruction?.parsed?.info.tokenAmount?.amount ??
        '0',
    );

    const source = Wallet.nativeSolana({ pubkey: sourcePubkey, lamports: null });
    const destination = Wallet.nativeSolana({ pubkey: destinationPubkey, lamports: null });

    return new TransferInfo({
      source,
      destination,
      authority: null,
      destinationAuthority: null,
      rawAmount: convertToBalance(lamports, source.token.decimals),
      account: config.accountView,
    });
  }

  private async _parseSPLTransfer({
    transactionInfo,
    config,
  }: {
    transactionInfo: TransactionInfo;
    config: Configuration;
  }): Promise<TransferInfo | null> {
    const instructions = transactionInfo.transaction.message.instructions;
    const postTokenBalances = transactionInfo.meta?.postTokenBalances ?? [];
    const accountKeys = transactionInfo.transaction.message.accountKeys;

    // get pubkeys
    const transferInstruction = instructions.at(-1);
    const authority = transferInstruction?.parsed?.info.authority;
    const sourcePubkey = transferInstruction?.parsed?.info.source;
    const destinationPubkey = transferInstruction?.parsed?.info.destination;

    // get lamports
    const lamports = new u64(
      transferInstruction?.parsed?.info.lamports ??
        transferInstruction?.parsed?.info.amount ??
        transferInstruction?.parsed?.info.tokenAmount?.amount ??
        '0',
    );

    let destinationAuthority: string | undefined;
    const createATokenInstruction = instructions.find(
      (inst) =>
        inst.programId.toString() ===
        SolanaSDKPublicKey.splAssociatedTokenAccountProgramId.toString(),
    );
    if (createATokenInstruction) {
      // send to associated token
      destinationAuthority = createATokenInstruction.parsed?.info.wallet;
    } else {
      const initializeAccountInstruction = instructions.find(
        (inst) =>
          inst.programId.toString() === SolanaSDKPublicKey.tokenProgramId.toString() &&
          inst.parsed?.type === 'initializeAccount',
      );
      if (initializeAccountInstruction) {
        // send to new token address (deprecated)
        destinationAuthority = initializeAccountInstruction.parsed?.info.owner;
      }
    }

    // Define token with mint
    let transferInfo: TransferInfo;
    const tokenBalance = postTokenBalances.find((b) => b.mint);
    if (tokenBalance) {
      // if the wallet that is opening is SOL, then modify myAccount
      let myAccount = config.accountView;
      if (
        sourcePubkey !== myAccount &&
        destinationPubkey !== myAccount &&
        accountKeys.length >= 4
      ) {
        // send
        if (myAccount === accountKeys[0]!.pubkey.toString()) {
          myAccount = sourcePubkey;
        }

        if (myAccount === accountKeys[3]!.pubkey.toString()) {
          myAccount = destinationPubkey;
        }
      }

      const token = await this._tokensRepository.getTokenWithMint(tokenBalance.mint);
      const source = new Wallet({ pubkey: sourcePubkey, lamports: null, token: token });
      const destination = new Wallet({ pubkey: destinationPubkey, lamports: null, token: token });
      transferInfo = new TransferInfo({
        source: source,
        destination: destination,
        authority: authority,
        destinationAuthority: destinationAuthority,
        rawAmount: convertToBalance(lamports, source.token.decimals),
        account: myAccount,
      });
    } else {
      // Mint not found
      const accountInfo = await this._apiClient.getAccountInfoOr<AccountInfo | null>({
        account: sourcePubkey,
        anotherAccount: destinationPubkey,
        decodedTo: AccountInfo,
      });
      const token = await this._tokensRepository.getTokenWithMint(
        accountInfo?.data?.mint.toString(),
      );
      const source = new Wallet({ pubkey: sourcePubkey, lamports: null, token: token });
      const destination = new Wallet({ pubkey: destinationPubkey, lamports: null, token: token });

      transferInfo = new TransferInfo({
        source: source,
        destination: destination,
        authority: authority,
        destinationAuthority: destinationAuthority,
        rawAmount: convertToBalance(lamports, source.token.decimals),
        account: config.accountView,
      });
    }

    if (transferInfo.destinationAuthority) {
      return transferInfo;
    }
    const account = transferInfo.destination?.pubkey;
    if (!account) {
      return transferInfo;
    }

    try {
      const accountInfo = await this._apiClient.getAccountInfo({
        account,
        decodedTo: AccountInfo,
      });
      return new TransferInfo({
        source: transferInfo.source,
        destination: transferInfo.destination,
        authority: transferInfo.authority,
        destinationAuthority: accountInfo?.owner.toString(),
        rawAmount: transferInfo.rawAmount,
        account: config.accountView,
      });
    } catch {
      return new TransferInfo({
        source: transferInfo.source,
        destination: transferInfo.destination,
        authority: transferInfo.authority,
        destinationAuthority: null,
        rawAmount: transferInfo.rawAmount,
        account: config.accountView,
      });
    }
  }
}
