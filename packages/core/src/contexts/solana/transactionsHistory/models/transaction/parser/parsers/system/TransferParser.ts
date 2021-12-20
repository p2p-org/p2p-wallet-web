import { SYSTEM_PROGRAM_ID } from '../../../../../../../../constants/publicKeys';
import type { ParsedConfirmedTransaction, ParsedInstruction } from '../../../../../types';
import type { AbstractTransaction, Parser, TransactionDetails } from '../types';

export class TransferTransaction implements AbstractTransaction {
  constructor(
    public source: string,
    public destination: string,
    public amount: number,
    public wasPaidByP2POrg?: boolean,
  ) {}

  details(source?: string): TransactionDetails {
    const isReceiver = this.destination === source;

    if (isReceiver) {
      return {
        type: 'receive',
        icon: 'bottom',
        isReceiver,
      };
    }

    return {
      type: 'transfer',
      icon: 'top',
      isReceiver,
    };
  }
}

export class TransferParser implements Parser {
  /**
   Check if transaction is transfer transaction
   */
  public static can(instructions: ParsedInstruction[]) {
    return (
      (instructions.length == 1 || instructions.length == 4 || instructions.length == 2) &&
      (instructions.at(-1)?.parsed?.type == 'transfer' ||
        instructions.at(-1)?.parsed?.type == 'transferChecked')
    );
  }

  public static parse(transactionInfo: ParsedConfirmedTransaction): TransferTransaction {
    const instructions = transactionInfo.transaction.message.instructions;

    // const accountKeys = transactionInfo.transaction.message.accountKeys;
    // const p2pFeePayerPubkeys = p2pFeePayerPubkey;

    // get pubkeys
    const transferInstruction = instructions.at(-1) as ParsedInstruction | undefined;
    const source = transferInstruction?.parsed?.info.source;
    const destination = transferInstruction?.parsed?.info.destination;

    // get lamports
    const lamports =
      transferInstruction?.parsed?.info.lamports ??
      Number(
        transferInstruction?.parsed?.info.amount ??
          transferInstruction?.parsed?.info.tokenAmount?.amount ??
          '0',
      );

    let result: TransferTransaction;
    // SOL to SOL
    if (transferInstruction?.programId.equals(SYSTEM_PROGRAM_ID)) {
      result = new TransferTransaction(source, destination, lamports);
    }
    // SPL to SPL token
    else {
      // TODO: check we need authority or not
      result = new TransferTransaction(source, destination, lamports);
    }

    // define if transaction was paid by p2p.org
    // const payer = accountKeys[0]?.pubkey?.toBase58();
    // if (p2pFeePayerPubkeys.contains(payer)) {
    //   result.wasPaidByP2POrg = true;
    // }

    return result;
  }
}
