import type { ProcessingTx } from 'new/sdk/RenVM';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import type { NotificationService } from 'new/services/NotificationService';
import { getMintNotificationRenderer } from 'new/ui/notifications/mintNotificationRenderer';
import { numberToString } from 'new/utils/NumberExtensions';

export const notifyTransactionIsWaitingForMint = (
  tx: ProcessingTx,
  notificationService: Readonly<NotificationService>,
): void => {
  // show notification only when user is on page that differs from Receive
  //if (location.pathname.includes('/receive')) {
  //   return;
  // }

  if (!tx) {
    return;
  }

  const txAmountStr = numberToString(convertToBalance(tx.tx.value, 8), {
    maximumFractionDigits: 8,
  });

  // is submitted and waiting for minting
  if (!tx.mintedAt && tx.submittedAt) {
    notificationService.show(
      getMintNotificationRenderer({
        header: 'Awaiting the signature on your wallet',
        text: `Mint ${txAmountStr} BTC`,
        status: 'warning',
      }),
    );

    return;
  }

  // is confirming or confirmed
  // const header = !tx.confirmedAt
  //   ? 'Waiting for deposit confirmation...'
  //   : 'The deposit has been confirmed!';
  //
  // const status = !tx.confirmedAt ? 'confirmingDeposit' : 'confirmedDeposit';
  //
  // const confirmationsAmount = tx.threeVoteAt ? 3 : tx.twoVoteAt ? 2 : tx.oneVoteAt ? 1 : 0;
  //
  // notificationService.show({
  //   type: 'confirmingDeposit',
  //   status,
  //   header,
  //   text: `${confirmationsAmount} / ${ProcessingTx.maxVote}`,
  // });
};
