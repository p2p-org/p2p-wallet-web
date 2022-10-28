import { u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import type {
  InnerInstruction,
  SolanaSDK,
  SolanaTokensRepository,
  Token,
  TransactionInfo,
} from 'new/sdk/SolanaSDK';
import {
  AccountInfo,
  convertToBalance,
  instructionsData,
  SolanaSDKPublicKey,
  trySafe,
  Wallet,
} from 'new/sdk/SolanaSDK';

import { SwapInfo } from '../model/info/SwapInfo';
import type { ParsedTransactionInfoType } from '../model/ParsedTransaction';
import type { Configuration } from '../TransactionParserService';
import type { TransactionParseStrategy } from './TransactionParseStrategy';

/// A strategy for orca swap transactions.
export class OrcaSwapParseStrategy implements TransactionParseStrategy {
  /// The list of orca program signatures that will be parsed by this strategy
  private _orcaProgramSignatures = [
    SolanaSDKPublicKey.orcaSwapId(1).toString(),
    SolanaSDKPublicKey.orcaSwapId(2).toString(),
    '9qvG1zUp8xF1Bi4m6UdRNby1BAAuaDrUxSpv4CmRRMjL' /* main deprecated */,
    'SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8' /* main deprecated */,
  ];

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
    return transactionInfo.transaction.message.instructions.some((inst) =>
      this._orcaProgramSignatures.includes(inst.programId.toString()),
    );
  }

  async parse({
    transactionInfo,
    config,
  }: {
    transactionInfo: TransactionInfo;
    config: Configuration;
  }): Promise<ParsedTransactionInfoType | null> {
    const innerInstructions = transactionInfo.meta?.innerInstructions;

    switch (true) {
      case this._isLiquidityToPool(innerInstructions):
        return null;
      case this._isBurn(innerInstructions):
        return null;
      default:
        return this._parse({ transactionInfo, config });
    }
  }

  // TODO: looks like we need cancellation here
  private async _parse({
    transactionInfo,
    config,
  }: {
    transactionInfo: TransactionInfo;
    config: Configuration;
  }): Promise<ParsedTransactionInfoType | null> {
    // Filter swap instructions
    const swapInstructions = instructionsData(transactionInfo).filter((data) =>
      this._orcaProgramSignatures.includes(data.instruction.programId.toString()),
    );

    // A swap should have at lease one orca instruction.
    if (swapInstructions.length === 0) {
      return this._parseFailedTransaction({ transactionInfo, accountSymbol: config.symbolView });
    }

    // Get source and target
    const source = swapInstructions[0]?.innerInstruction?.instructions[0];
    const destination = swapInstructions.at(-1)?.innerInstruction?.instructions.at(-1);
    if (!source || !destination) {
      return this._parseFailedTransaction({ transactionInfo, accountSymbol: config.symbolView });
    }

    const sourceInfo = source.parsed?.info;
    const destinationInfo = destination.parsed?.info;
    if (!sourceInfo || !destinationInfo) {
      return null;
    }

    // Get accounts info
    const [sourceAccount, destinationAccount] = await Promise.all([
      this._apiClient.getAccountInfoOr<AccountInfo | null>({
        account: sourceInfo.source,
        anotherAccount: sourceInfo.destination,
        decodedTo: AccountInfo,
      }),
      this._apiClient.getAccountInfoOr<AccountInfo | null>({
        account: destinationInfo.source,
        anotherAccount: destinationInfo.destination,
        decodedTo: AccountInfo,
      }),
    ]);

    // Get tokens info
    const [sourceToken, destinationToken]: [Token, Token] = await Promise.all([
      this._tokensRepository.getTokenWithMint(sourceAccount?.data?.mint.toString()),
      this._tokensRepository.getTokenWithMint(destinationAccount?.data?.mint.toString()),
    ]);

    const sourceWallet = new Wallet({
      pubkey: trySafe(
        () => (sourceInfo.source ? new PublicKey(sourceInfo.source).toString() : null),
        null,
      ),
      lamports: sourceAccount?.data?.lamports,
      token: sourceToken,
    });

    const destinationWallet = new Wallet({
      pubkey: trySafe(
        () =>
          destinationInfo.destination
            ? new PublicKey(destinationInfo.destination).toString()
            : null,
        null,
      ),
      lamports: destinationAccount?.data?.lamports,
      token: destinationToken,
    });

    const sourceAmountLamports = new u64(sourceInfo.amount ?? 0);
    const destinationAmountLamports = new u64(destinationInfo.amount ?? 0);

    return new SwapInfo({
      source: sourceWallet,
      sourceAmount: convertToBalance(new u64(sourceAmountLamports), sourceWallet.token.decimals),
      destination: destinationWallet,
      destinationAmount: convertToBalance(
        new u64(destinationAmountLamports),
        destinationWallet.token.decimals,
      ),
      accountSymbol: config.symbolView,
    });
  }

  private async _parseFailedTransaction({
    transactionInfo,
    accountSymbol,
  }: {
    transactionInfo: TransactionInfo;
    accountSymbol?: string;
  }): Promise<SwapInfo | null> {
    const postTokenBalances = transactionInfo.meta?.postTokenBalances;
    const approveInstruction = transactionInfo.transaction.message.instructions.find(
      (inst) => inst?.parsed?.type === 'approve',
    );
    const sourceAmountString = approveInstruction?.parsed?.info.amount;
    const sourceMint = postTokenBalances?.[0]?.mint;
    const destinationMint = postTokenBalances?.at(-1)?.mint;
    if (
      !postTokenBalances ||
      !approveInstruction ||
      !sourceAmountString ||
      !sourceMint ||
      !destinationMint
    ) {
      return null;
    }

    const sourceToken = await this._tokensRepository.getTokenWithMint(sourceMint);
    const destinationToken = await this._tokensRepository.getTokenWithMint(destinationMint);

    const sourceWallet = new Wallet({
      pubkey: approveInstruction.parsed?.info.source,
      lamports: new u64(postTokenBalances[0]?.uiTokenAmount.amount ?? 0),
      token: sourceToken,
    });

    const destinationWallet = new Wallet({
      pubkey: destinationToken.symbol === 'SOL' ? approveInstruction.parsed?.info.owner : null,
      lamports: new u64(postTokenBalances?.at(-1)?.uiTokenAmount.amount ?? 0),
      token: destinationToken,
    });

    return new SwapInfo({
      source: sourceWallet,
      sourceAmount: convertToBalance(new u64(sourceAmountString), sourceWallet.token.decimals),
      destination: destinationWallet,
      destinationAmount: null,
      accountSymbol,
    });
  }

  private _isLiquidityToPool(innerInstructions?: InnerInstruction[] | null): boolean {
    const instructions = innerInstructions?.[0]?.instructions;
    if (!instructions) {
      return false;
    }
    switch (instructions.length) {
      case 3:
        return (
          instructions[0]!.parsed?.type === 'transfer' &&
          instructions[1]!.parsed?.type === 'transfer' &&
          instructions[2]!.parsed?.type === 'mintTo'
        );
      default:
        return false;
    }
  }

  /// Check the instruction is a burn
  private _isBurn(innerInstructions?: InnerInstruction[] | null): boolean {
    const instructions = innerInstructions?.[0]?.instructions;
    if (!instructions) {
      return false;
    }
    switch (instructions.length) {
      case 3:
        return (
          instructions.length === 3 &&
          instructions[0]!.parsed?.type === 'burn' &&
          instructions[1]!.parsed?.type === 'transfer' &&
          instructions[2]!.parsed?.type === 'transfer'
        );
      default:
        return false;
    }
  }
}
