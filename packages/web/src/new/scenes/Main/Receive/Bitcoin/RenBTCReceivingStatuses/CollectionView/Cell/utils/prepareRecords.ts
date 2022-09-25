import type { LockAndMintProcessingTx } from 'new/sdk/RenVM/actions/LockAndMint';

import { Record, Status } from '../Record';

export const prepareRecords = (processingTx: LockAndMintProcessingTx): Record[] => {
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
        vout: 3,
      }),
    );
  }
  if (processingTx.twoVoteAt) {
    records.push(
      new Record({
        txid: processingTx.tx.txid,
        status: Status.waitingForConfirmation,
        time: processingTx.twoVoteAt,
        vout: 2,
      }),
    );
  }
  if (processingTx.oneVoteAt) {
    records.push(
      new Record({
        txid: processingTx.tx.txid,
        status: Status.waitingForConfirmation,
        time: processingTx.oneVoteAt,
        vout: 1,
      }),
    );
  }
  if (processingTx.receivedAt) {
    records.push(
      new Record({
        txid: processingTx.tx.txid,
        status: Status.waitingForConfirmation,
        time: processingTx.receivedAt,
        vout: 0,
      }),
    );
  }

  records.sort((rc1, rc2) => {
    if (rc1.time === rc2.time) {
      return (rc2.vout ?? Number.MAX_SAFE_INTEGER) - (rc1.vout ?? Number.MAX_SAFE_INTEGER);
    } else {
      return rc2.time - rc1.time;
    }
  });

  return records;
};
