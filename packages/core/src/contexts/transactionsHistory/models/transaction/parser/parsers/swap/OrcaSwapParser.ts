import { NATIVE_MINT } from '@saberhq/token-utils';
import type { ParsedInnerInstruction } from '@solana/web3.js';

import type { ParsedConfirmedTransaction, ParsedInstruction } from '../../../../../';
import { instructionsData } from '../../utils/instructionsData';
import type { Parser } from '../';
import { SwapTransaction } from './types';

// Example transaction for parsing:
// https://explorer.solana.com/tx/3toxoqvPizPTAQopZGwrKoSZZpb6jwnETP71rrRsSdbYrpa7xwgWduXxzHCY5nVYXXMMRKNfki1PPHttETU2eEGW

export class OrcaSwapParser implements Parser {
  private static _supportedProgramId = [
    'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1' /*swap ocra*/,
    '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP' /*swap ocra v2*/,
    '9qvG1zUp8xF1Bi4m6UdRNby1BAAuaDrUxSpv4CmRRMjL' /*main deprecated*/,
    'SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8' /*main deprecated*/,
  ];

  /**
   Check instruction can be parsed
   */
  static can(instructions: ParsedInstruction[]) {
    return instructions.some((inst) =>
      this._supportedProgramId.includes(inst.programId.toBase58()),
    );
  }

  /**
   Check liquidity to pool
   - Parameter instructions: inner instructions
   */
  private static _isLiquidityToPool(innerInstructions?: ParsedInnerInstruction[] | null) {
    const instructions = innerInstructions?.[0]?.instructions as ParsedInstruction[] | null;
    switch (instructions?.length) {
      case 3:
        return (
          instructions[0]?.parsed?.type === 'transfer' &&
          instructions[1]?.parsed?.type === 'transfer' &&
          instructions[2]?.parsed?.type === 'mintTo'
        );
      default:
        return false;
    }
  }

  /**
   Check liquidity to pool
   - Parameter instructions: inner instructions
   */
  private static _isBurn(innerInstructions?: ParsedInnerInstruction[] | null) {
    const instructions = innerInstructions?.[0]?.instructions as ParsedInstruction[] | null;
    switch (instructions?.length) {
      case 3:
        return (
          instructions?.length === 3 &&
          instructions[0]?.parsed?.type === 'burn' &&
          instructions[1]?.parsed?.type === 'transfer' &&
          instructions[2]?.parsed?.type === 'transfer'
        );
      default:
        return false;
    }
  }

  private static _parseFailedTransaction(
    transactionInfo: ParsedConfirmedTransaction,
  ): SwapTransaction | null {
    const postTokenBalances = transactionInfo.meta?.postTokenBalances;
    const approveInstruction = transactionInfo.transaction.message.instructions.find(
      (inst: ParsedInstruction) => inst?.parsed?.type === 'approve',
    );
    const sourceAmountString = approveInstruction?.parsed?.info.amount;
    const destinationMint = postTokenBalances?.at(-1)?.mint;

    if (!postTokenBalances || !approveInstruction || !sourceAmountString || !destinationMint) {
      return null;
    }

    let destination: string | undefined;
    if (destinationMint === NATIVE_MINT.toBase58()) {
      destination = approveInstruction?.parsed?.info.owner;
    }

    const source = approveInstruction?.parsed?.info.source;
    const sourceAmount =
      sourceAmountString || (postTokenBalances?.at(0)?.uiTokenAmount.amount ?? '0');
    const destinationAmount = postTokenBalances?.at(-1)?.uiTokenAmount.amount ?? '0';

    // get decimals
    return new SwapTransaction(source, sourceAmount, destination, destinationAmount);
  }

  private static _parse(transactionInfo: ParsedConfirmedTransaction): SwapTransaction | null {
    const swapInstructions = instructionsData(transactionInfo).filter((data) =>
      this._supportedProgramId.includes(data.instruction.programId.toBase58()),
    );

    // A swap should have at lease one orca instruction.
    if (swapInstructions.length === 0) {
      return this._parseFailedTransaction(transactionInfo);
    }

    // Get source and target (It can be user's public key, amount of transfer, ...)
    const sourceInstruction = swapInstructions.at(0)?.innerInstruction?.instructions.at(0);
    const destinationInstruction = swapInstructions.at(-1)?.innerInstruction?.instructions.at(-1);
    if (!sourceInstruction || !destinationInstruction) {
      return this._parseFailedTransaction(transactionInfo);
    }

    const sourceInfo = sourceInstruction.parsed?.info;
    const destinationInfo = destinationInstruction.parsed?.info;

    let source = sourceInfo?.source || sourceInfo?.destination;
    const sourceAmount = sourceInfo?.amount ?? '0';
    let destination = destinationInfo?.destination || destinationInfo?.source;
    const destinationAmount = destinationInfo?.amount ?? '0';

    // For swap with WSOL. So WSOL account closed after tx and we try to find true account
    // 1. SOL/X
    // 2. X/SOL
    const closeInstruction = transactionInfo.transaction.message.instructions.find(
      (inst: ParsedInstruction) => inst.parsed?.type === 'closeAccount',
    );
    if (closeInstruction?.parsed) {
      if (closeInstruction.parsed.info.account === source) {
        source = closeInstruction.parsed.info.destination;
      }
      if (closeInstruction.parsed.info.account === destination) {
        destination = closeInstruction.parsed.info.destination;
      }
    }

    return new SwapTransaction(source, sourceAmount, destination, destinationAmount);
  }

  static parse(transactionInfo: ParsedConfirmedTransaction): SwapTransaction | null {
    const innerInstructions = transactionInfo.meta?.innerInstructions;

    switch (true) {
      case this._isLiquidityToPool(innerInstructions):
        return null;
      case this._isBurn(innerInstructions):
        return null;
      default:
        return this._parse(transactionInfo);
    }
  }
}
