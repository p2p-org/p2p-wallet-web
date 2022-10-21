import { u64 } from '@solana/spl-token';

import type { ProcessingTx } from 'new/sdk/RenVM';

import { Record, Status } from '../Record';

export const prepareRecords = (processingTx: ProcessingTx): Record[] => {
  const records: Record[] = [];
  if (processingTx.mintedAt) {
    records.push(
      new Record({
        txid: processingTx.tx.txid,
        status: Status.minted,
        time: processingTx.mintedAt,
        amount: processingTx.tx.value,
      }),
    );
  }
  if (processingTx.submittedAt) {
    records.push(
      new Record({
        txid: processingTx.tx.txid,
        status: Status.submitted,
        time: processingTx.submittedAt,
      }),
    );
  }
  if (processingTx.confirmedAt) {
    records.push(
      new Record({
        txid: processingTx.tx.txid,
        status: Status.confirmed,
        time: processingTx.confirmedAt,
      }),
    );
  }
  if (processingTx.threeVoteAt) {
    records.push(
      new Record({
        txid: processingTx.tx.txid,
        status: Status.waitingForConfirmation,
        time: processingTx.threeVoteAt,
        vout: new u64(3),
      }),
    );
  }
  if (processingTx.twoVoteAt) {
    records.push(
      new Record({
        txid: processingTx.tx.txid,
        status: Status.waitingForConfirmation,
        time: processingTx.twoVoteAt,
        vout: new u64(2),
      }),
    );
  }
  if (processingTx.oneVoteAt) {
    records.push(
      new Record({
        txid: processingTx.tx.txid,
        status: Status.waitingForConfirmation,
        time: processingTx.oneVoteAt,
        vout: new u64(1),
      }),
    );
  }
  if (processingTx.receivedAt) {
    records.push(
      new Record({
        txid: processingTx.tx.txid,
        status: Status.waitingForConfirmation,
        time: processingTx.receivedAt,
        vout: new u64(0),
      }),
    );
  }

  records.sort((rc1, rc2) => {
    if (rc1.time === rc2.time) {
      return (rc2.vout ?? new u64(Number.MAX_SAFE_INTEGER))
        .sub(rc1.vout ?? new u64(Number.MAX_SAFE_INTEGER))
        .toNumber();
    } else {
      return rc2.time.getTime() - rc1.time.getTime();
    }
  });

  return records;
};
