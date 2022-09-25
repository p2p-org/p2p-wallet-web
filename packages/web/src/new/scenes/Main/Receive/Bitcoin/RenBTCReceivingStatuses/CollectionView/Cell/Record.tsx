import { u64 } from '@solana/spl-token';

import { convertToBalance } from 'new/sdk/SolanaSDK';
import { numberToString } from 'new/utils/NumberExtensions';

export enum Status {
  waitingForConfirmation = 'waitingForConfirmation',
  confirmed = 'confirmed',
  submitted = 'submitted',
  minted = 'minted',
}

export class Record {
  txid: string;
  status: Status;
  time: number;
  vout?: number;
  amount?: number;

  constructor({
    txid,
    status,
    time,
    vout,
    amount,
  }: {
    txid: string;
    status: Status;
    time: number;
    vout?: number;
    amount?: number;
  }) {
    this.txid = txid;
    this.status = status;
    this.time = time;
    this.vout = vout;
    this.amount = amount;
  }

  get stringValue(): string {
    switch (this.status) {
      case Status.waitingForConfirmation:
        return 'Waiting for deposit confirmation';
      case Status.confirmed:
        return 'Submitting to RenVM';
      case Status.submitted:
        return 'Minting';
      case Status.minted:
        return `Successfully minted ${numberToString(
          convertToBalance(new u64(this.amount || 0), 8),
          { maximumFractionDigits: 9 },
        )} renBTC!`;
    }
  }
}
