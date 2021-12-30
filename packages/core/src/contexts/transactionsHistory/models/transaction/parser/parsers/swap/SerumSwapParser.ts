import { uniq } from 'ramda';

import { USDC_MINT, USDT_MINT } from '../../../../../../../constants/publicKeys';
import type {
  ParsedConfirmedTransaction,
  ParsedInnerInstruction,
  ParsedInstruction,
} from '../../../../../types';
import type { Parser } from '../';
import { SwapTransaction } from './types';

export class SerumSwapParser implements Parser {
  private static _supportedProgramId = ['22Y43yTVxuUkoRKdm9thyRhQ3SdgQS7c7kB6UNCiaczD'];

  private static _getSerumSwapInstructionIndex(instructions: ParsedInstruction[]): number {
    return instructions
      .reverse()
      .findIndex((inst) => this._supportedProgramId.includes(inst.programId.toBase58()));
  }

  /**
   Check if transaction is a serum swap transaction
   - Parameter instructions: instructions in transaction
   */
  static can(instructions: ParsedInstruction[]) {
    return this._getSerumSwapInstructionIndex(instructions) !== -1;
  }

  private static _isUSDxMint(mint: string | undefined): boolean {
    return USDC_MINT.toBase58() === mint || USDT_MINT.toBase58() === mint;
  }

  static parse(transactionInfo: ParsedConfirmedTransaction): SwapTransaction | null {
    const instructions = transactionInfo.transaction.message.instructions;
    const preTokenBalances = transactionInfo.meta?.preTokenBalances;

    const swapInstructionIndex = this._getSerumSwapInstructionIndex(
      transactionInfo.transaction.message.instructions,
    );
    const innerInstruction = (
      transactionInfo.meta?.innerInstructions as ParsedInnerInstruction[] | undefined
    )?.find((innerInst) =>
      innerInst.instructions.some((inst) =>
        this._supportedProgramId.includes(inst.programId.toBase58()),
      ),
    );

    // get swapInstruction
    const swapInstruction = instructions[swapInstructionIndex];
    if (!swapInstruction) {
      return null;
    }

    // get all mints
    let mints = preTokenBalances ? uniq(preTokenBalances?.map((balance) => balance.mint)) : [];
    // max: 3
    if (mints.length < 2) {
      return null;
    }

    // transitive swap: remove usdc or usdt if exists
    if (mints.length === 3) {
      mints = mints.filter((mint) => this._isUSDxMint(mint));
    }

    // define swap type
    const isTransitiveSwap = !mints.some((mint) => this._isUSDxMint(mint));

    // assert
    const accounts = swapInstruction.accounts;
    if (!accounts) {
      return null;
    }

    if (isTransitiveSwap && accounts.length != 27) {
      return null;
    }

    if (!isTransitiveSwap && accounts.length != 16) {
      return null;
    }

    // get from and to address
    let source: string | undefined;
    let destination: string | undefined;

    if (isTransitiveSwap) {
      // transitive
      source = accounts[6]?.toBase58();
      destination = accounts[21]?.toBase58();
    } else {
      // direct
      source = accounts[10]?.toBase58();
      destination = accounts[12]?.toBase58();

      if (this._isUSDxMint(mints.at(0)) && !this._isUSDxMint(mints.at(-1))) {
        [source, destination] = [destination, source];
      }
    }

    // amounts
    let sourceAmount;
    let destinationAmount;

    // from amount
    const fromInstruction = innerInstruction?.instructions.find(
      (inst) => inst.parsed?.type === 'transfer' && inst.parsed?.info.source === source,
    );
    const fromAmountString = fromInstruction?.parsed?.info.amount;
    if (fromAmountString) {
      sourceAmount = fromAmountString;
    }

    // to amount
    const toInstruction = innerInstruction?.instructions.find(
      (inst) => inst.parsed?.type === 'transfer' && inst.parsed?.info.destination === destination,
    );
    const toAmountString = toInstruction?.parsed?.info.amount;
    if (toAmountString) {
      destinationAmount = toAmountString;
    }

    // if swap from native sol, detect if from or to address is a new account
    const createAccountInstruction = (instructions as ParsedInstruction[]).find((inst) => {
      inst.parsed?.type === 'createAccount' && inst.parsed?.info.newAccount === source;
    });
    const realSource = createAccountInstruction?.parsed?.info.source;
    if (realSource) {
      source = realSource;
    }

    return new SwapTransaction(source, sourceAmount, destination, destinationAmount);
  }
}
