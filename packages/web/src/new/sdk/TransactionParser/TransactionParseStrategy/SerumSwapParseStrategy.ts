import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import { uniq } from 'ramda';

import type { Lamports, SolanaTokensRepository, TransactionInfo } from 'new/sdk/SolanaSDK';
import { convertToBalance, SolanaSDKPublicKey, Wallet } from 'new/sdk/SolanaSDK';

import { SwapInfo } from '../model/info/SwapInfo';
import type { ParsedTransactionInfoType } from '../model/ParsedTransaction';
import type { Configuration } from '../TransactionParserService';
import type { TransactionParseStrategy } from './TransactionParseStrategy';

export class SerumSwapParseStrategy implements TransactionParseStrategy {
  private _tokensRepository: SolanaTokensRepository;

  constructor({ tokensRepository }: { tokensRepository: SolanaTokensRepository }) {
    this._tokensRepository = tokensRepository;
  }

  isHandlable(transactionInfo: TransactionInfo): boolean {
    const instructions = transactionInfo.transaction.message.instructions;
    return instructions.some(
      // TODO: check type of programId, maybe we don't need toString
      (inst) => inst.programId.toString() === SolanaSDKPublicKey.serumSwapPID.toString(),
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
    const innerInstruction = transactionInfo.meta?.innerInstructions?.find((innerInst) =>
      innerInst.instructions.some(
        // TODO: check type of programId, maybe we don't need toString
        (inst) => inst.programId.toString() === SolanaSDKPublicKey.serumSwapPID.toString(),
      ),
    );

    const swapInstructionIndex = this._serumInstruction(transactionInfo)!;
    const swapInstruction = instructions[swapInstructionIndex];
    if (!swapInstruction) {
      return null;
    }
    const preTokenBalances = transactionInfo.meta?.preTokenBalances;

    // get all mints
    let mints = preTokenBalances ? uniq(preTokenBalances.map((b) => b.mint)) : [];
    // max: 3
    if (mints.length < 2) {
      return null;
    }

    // transitive swap: remove usdc or usdt if exists
    if (mints.length === 3) {
      mints = mints.filter((mint) => isUsdxMint(mint));
    }

    // define swap type
    const isTransitiveSwap = !mints.some((mint) => isUsdxMint(mint));

    // assert
    const accounts = swapInstruction.accounts;
    if (!accounts) {
      return null;
    }
    if (isTransitiveSwap && accounts.length !== 27) {
      return null;
    }
    if (!isTransitiveSwap && accounts.length !== 16) {
      return null;
    }

    // get from and to address
    let fromAddress: string;
    let toAddress: string;

    // TODO: check toString()
    if (isTransitiveSwap) {
      // transitive
      fromAddress = accounts[6]!.toString();
      toAddress = accounts[21]!.toString();
    } else {
      // direct
      fromAddress = accounts[10]!.toBase58();
      toAddress = accounts[12]!.toBase58();

      if (isUsdxMint(mints.at(0)) === true && isUsdxMint(mints.at(-1)) === false) {
        [fromAddress, toAddress] = [toAddress, fromAddress];
      }
    }

    // amounts
    let fromAmount: Lamports | undefined;
    let toAmount: Lamports | undefined;

    // from amount
    const fromInstruction = innerInstruction?.instructions.find(
      (inst) => inst.parsed?.type === 'transfer', // TODO: check that we need to add inst.parsed?.info.source === fromAddress
    );
    const fromAmountString = fromInstruction?.parsed?.info.amount;
    if (fromAmountString) {
      fromAmount = new u64(fromAmountString);
    }

    // to amount
    const toInstruction = innerInstruction?.instructions.find(
      (inst) => inst.parsed?.type === 'transfer', // TODO: check that we need to add inst.parsed?.info.destination === toAddress
    );
    const toAmountString = toInstruction?.parsed?.info.amount;
    if (toAmountString) {
      toAmount = new u64(toAmountString);
    }

    // if swap from native sol, detect if from or to address is a new account
    const createAccountInstruction = instructions.find(
      (inst) =>
        inst.parsed?.type === 'createAccount' && inst.parsed?.info.newAccount === fromAddress,
    );
    const realSource = createAccountInstruction?.parsed?.info.source;
    if (realSource) {
      fromAddress = realSource;
    }

    const sourceToken = await this._tokensRepository.getTokenWithMint(mints[0]);
    const destinationToken = await this._tokensRepository.getTokenWithMint(mints[1]);

    const sourceWallet = new Wallet({
      pubkey: fromAddress,
      lamports: ZERO, // post token balance?
      token: sourceToken,
    });

    const destinationWallet = new Wallet({
      pubkey: toAddress,
      lamports: ZERO, // post token balances
      token: destinationToken,
    });

    return new SwapInfo({
      source: sourceWallet,
      sourceAmount: fromAmount ? convertToBalance(fromAmount, sourceToken.decimals) : null,
      destination: destinationWallet,
      destinationAmount: toAmount ? convertToBalance(toAmount, destinationToken.decimals) : null,
      accountSymbol: config.symbolView,
    });
  }

  private _serumInstruction(transactionInfo: TransactionInfo): number | null {
    const instructions = transactionInfo.transaction.message.instructions;
    // TODO: check type of programId, maybe we don't need toString
    return instructions.findLastIndex(
      (inst) => inst.programId.toString() === SolanaSDKPublicKey.serumSwapPID.toString(),
    );
  }
}

function isUsdxMint(pubkey?: string): boolean | null {
  if (!pubkey) {
    return null;
  }

  return (
    pubkey === SolanaSDKPublicKey.usdcMint.toString() ||
    pubkey === SolanaSDKPublicKey.usdtMint.toString()
  );
}
