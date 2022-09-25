import { ZERO } from '@orca-so/sdk';
import type { u64 } from '@solana/spl-token';

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
  time: Date;
  vout?: u64;
  amount?: u64;

  constructor({
    txid,
    status,
    time,
    vout,
    amount,
  }: {
    txid: string;
    status: Status;
    time: Date;
    vout?: u64;
    amount?: u64;
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
        return `Successfully minted ${numberToString(convertToBalance(this.amount ?? ZERO, 8), {
          maximumFractionDigits: 9,
        })} renBTC!`;
    }
  }
}
