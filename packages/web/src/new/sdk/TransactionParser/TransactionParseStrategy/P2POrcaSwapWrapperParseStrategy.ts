import { u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import base58 from 'bs58';

import type { Lamports, SolanaTokensRepository, TransactionInfo } from 'new/sdk/SolanaSDK';
import { convertToBalance, SolanaSDKPublicKey, Token, trySafe, Wallet } from 'new/sdk/SolanaSDK';
import type { Configuration, ParsedTransactionInfoType } from 'new/sdk/TransactionParser';
import { SwapInfo } from 'new/sdk/TransactionParser';

import type { TransactionParseStrategy } from './TransactionParseStrategy';

export class P2POrcaSwapWrapperParseStrategy implements TransactionParseStrategy {
  /// The list of orca program signatures that will be parsed by this strategy
  private _orcaProgramSignatures = ['12YKFL4mnZz6CBEGePrf293mEzueQM3h8VLPUJsKpGs9'];

  private _tokensRepository: SolanaTokensRepository;

  constructor({ tokensRepository }: { tokensRepository: SolanaTokensRepository }) {
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
    return this._parse({ transactionInfo, config });
  }

  // TODO: looks like we need cancellation here
  private async _parse({
    transactionInfo,
    config,
  }: {
    transactionInfo: TransactionInfo;
    config: Configuration;
  }): Promise<ParsedTransactionInfoType | null> {
    // Filter P2P swap instructions
    const swapInstructionIndex = transactionInfo.transaction.message.instructions.findLastIndex(
      (i) => {
        if (this._orcaProgramSignatures.includes(i.programId.toString())) {
          const iData = i.data;
          if (iData && base58.decode(iData)[0] === 4) {
            return true;
          }
        }
        return false;
      },
    );
    if (!swapInstructionIndex) {
      return null;
    }

    // First attempt of extraction
    const swapInstruction = transactionInfo.transaction.message.instructions[swapInstructionIndex]!;
    let sourceAddress = swapInstruction.accounts[3]?.toString();
    if (!sourceAddress) {
      return null;
    }
    const resSource = await this._parseToken({
      transactionInfo,
      address: sourceAddress,
    });
    if (!resSource) {
      return null;
    }
    let { wallet: sourceWallet, amount: sourceChange } = resSource;
    let destinationAddress = swapInstruction.accounts[5]?.toString();
    if (!destinationAddress) {
      return null;
    }
    const resDest = await this._parseToken({
      transactionInfo,
      address: destinationAddress,
    });
    if (!resDest) {
      return null;
    }
    let { wallet: destinationWallet, amount: destinationChange } = resDest;

    const totalInstructions = transactionInfo.transaction.message.instructions.length;

    // Swap from native SOL
    if (sourceChange === 0 && swapInstructionIndex + 1 < totalInstructions) {
      const closeInstruction =
        transactionInfo.transaction.message.instructions[swapInstructionIndex + 1];
      if (closeInstruction?.programId.toString() === SolanaSDKPublicKey.tokenProgramId.toString()) {
        if (closeInstruction.parsed?.type === 'closeAccount') {
          const source = closeInstruction.parsed.info.destination;
          if (!source) {
            return null;
          }

          sourceAddress = source;
          const resSourceNew = await this._parseToken({
            transactionInfo,
            address: sourceAddress,
          });
          if (!resSourceNew) {
            return null;
          }
          const { wallet: newSourceWallet, amount: newSourceChange } = resSourceNew;

          sourceWallet = newSourceWallet;
          sourceChange = newSourceChange;
        }
      }
    }

    // Swap to native SOL
    if (destinationChange === 0 && swapInstructionIndex + 1 < totalInstructions) {
      const closeInstruction =
        transactionInfo.transaction.message.instructions[swapInstructionIndex + 1];
      if (closeInstruction?.programId.toString() === SolanaSDKPublicKey.tokenProgramId.toString()) {
        if (closeInstruction.parsed?.type === 'closeAccount') {
          const destination = closeInstruction.parsed.info.destination;
          if (!destination) {
            return null;
          }

          destinationAddress = destination;
          const resDestNew = await this._parseToken({
            transactionInfo,
            address: destinationAddress,
          });
          if (!resDestNew) {
            return null;
          }
          const { wallet: newDestinationWallet, amount: newDestinationChange } = resDest;

          destinationWallet = newDestinationWallet;
          destinationChange = newDestinationChange;
        }
      }
    }

    return new SwapInfo({
      source: sourceWallet,
      sourceAmount: sourceChange,
      destination: destinationWallet,
      destinationAmount: destinationChange,
      accountSymbol: config.symbolView,
    });
  }

  private async _parseToken({
    transactionInfo,
    address,
  }: {
    transactionInfo: TransactionInfo;
    address: string;
  }): Promise<{
    wallet: Wallet;
    amount: number;
  } | null> {
    const addressIndex = transactionInfo.transaction.message.accountKeys.findIndex(
      (acc) => acc.pubkey.toString() === address,
    );
    if (!addressIndex) {
      return null;
    }

    const mintAddress: string =
      transactionInfo.meta?.postTokenBalances?.find(
        (balance) => balance.accountIndex === addressIndex,
      )?.mint ?? Token.nativeSolana.address;

    let preWalletBalance: Lamports;

    if (mintAddress === Token.nativeSolana.address) {
      preWalletBalance = new u64(transactionInfo.meta?.preBalances[addressIndex] ?? 0);
    } else {
      preWalletBalance = new u64(
        transactionInfo.meta?.preTokenBalances?.find(
          (balance) => balance.accountIndex === addressIndex,
        )?.uiTokenAmount.amount ?? 0,
      );
    }

    let preBalance: number;
    let postBalance: number;
    if (mintAddress === Token.nativeSolana.address) {
      preBalance = transactionInfo.meta?.preBalances[addressIndex]
        ? convertToBalance(
            new u64(transactionInfo.meta.preBalances[addressIndex]!),
            Token.nativeSolana.decimals,
          )
        : 0;
      postBalance = transactionInfo.meta?.postBalances[addressIndex]
        ? convertToBalance(
            new u64(transactionInfo.meta.postBalances[addressIndex]!),
            Token.nativeSolana.decimals,
          )
        : 0;
    } else {
      preBalance =
        transactionInfo.meta?.preTokenBalances?.find(
          (balance) => balance.accountIndex === addressIndex,
        )?.uiTokenAmount.uiAmount ?? 0;
      postBalance =
        transactionInfo.meta?.postTokenBalances?.find(
          (balance) => balance.accountIndex === addressIndex,
        )?.uiTokenAmount.uiAmount ?? 0;
    }

    const sourceToken: Token = await this._tokensRepository.getTokenWithMint(mintAddress);

    const wallet = new Wallet({
      pubkey: trySafe(() => (address ? new PublicKey(address).toString() : null), null),
      lamports: preWalletBalance,
      token: sourceToken,
    });

    const amount = Math.abs(postBalance - preBalance);

    return { wallet, amount };
  }
}
