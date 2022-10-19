import type { ProcessingTx } from 'new/sdk/RenVM';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import type { NotificationService } from 'new/services/NotificationService';
import { getMintNotificationRenderer } from 'new/ui/notifications/mintNotificationRenderer';
import { numberToString } from 'new/utils/NumberExtensions';

export const notifyTransactionIsWaitingForMint = (
  tx: ProcessingTx,
  notificationService: Readonly<NotificationService>,
): void => {
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
};
