import { FEE_PAYER_PUBKEYS, SYSTEM_PROGRAM_ID } from '../../../../../../../constants/publicKeys';
import type { ParsedConfirmedTransaction, ParsedInstruction } from '../../../../../types';
import type { AbstractTransaction, Parser, TransactionDetails } from '../types';

export class TransferTransaction implements AbstractTransaction {
  constructor(
    public source: string,
    public destination: string,
    public amount: string,
    public wasPaidByP2POrg?: boolean,
  ) {}

  details(sources?: string[]): TransactionDetails {
    const isReceiver = this.destination ? sources?.includes(this.destination) : false;

    return {
      type: isReceiver ? 'receive' : 'transfer',
      icon: isReceiver ? 'bottom' : 'top',
      isReceiver,

      amount: this.amount,
      tokenAccount: isReceiver ? this.destination : this.source,
    };
  }
}

export class TransferParser implements Parser {
  /**
   Check if transaction is transfer transaction
   */
  public static can(instructions: ParsedInstruction[]) {
    return (
      (instructions.length === 1 || instructions.length === 4 || instructions.length === 2) &&
      (instructions.at(-1)?.parsed?.type == 'transfer' ||
        instructions.at(-1)?.parsed?.type == 'transferChecked')
    );
  }

  public static parse(transactionInfo: ParsedConfirmedTransaction): TransferTransaction {
    const instructions = transactionInfo.transaction.message.instructions;
    const accountKeys = transactionInfo.transaction.message.accountKeys;

    // get pubkeys
    const transferInstruction = instructions.at(-1) as ParsedInstruction | undefined;
    const source = transferInstruction?.parsed?.info.source;
    const destination = transferInstruction?.parsed?.info.destination;

    // get lamports
    const amount =
      transferInstruction?.parsed?.info.lamports ??
      transferInstruction?.parsed?.info.amount ??
      transferInstruction?.parsed?.info.tokenAmount?.amount ??
      '0';
    let result: TransferTransaction;

    // SOL to SOL
    if (transferInstruction?.programId.equals(SYSTEM_PROGRAM_ID)) {
      result = new TransferTransaction(source, destination, amount);
    }
    // SPL to SPL token
    else {
      // TODO: check we need authority or not
      result = new TransferTransaction(source, destination, amount);
    }

    // define if transaction was paid by p2p.org
    const payer = accountKeys[0]?.pubkey?.toBase58();
    if (payer && FEE_PAYER_PUBKEYS.has(payer)) {
      result.wasPaidByP2POrg = true;
    }

    return result;
  }
}
