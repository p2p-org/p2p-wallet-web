import { NotifyToast } from 'new/ui/components/common/NotifyToast';
import type { TransferParams } from 'new/ui/components/common/NotifyToast/NotifyToast';
import type { RendererParams } from 'new/ui/managers/NotificationManager';

export const getTransferNotificationRenderer =
  (params: TransferParams) =>
  ({ onClose }: RendererParams) => {
    return <NotifyToast type="transfer" onClose={onClose} {...params} />;
  };
