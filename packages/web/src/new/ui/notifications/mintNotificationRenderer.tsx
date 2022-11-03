import { NotifyToast } from 'new/ui/components/common/NotifyToast';
import type { TransferParams } from 'new/ui/components/common/NotifyToast/NotifyToast';
import type { RendererParams } from 'new/ui/managers/NotificationManager';

export const getMintNotificationRenderer =
  (params: TransferParams) =>
  ({ onClose }: RendererParams) => {
    return <NotifyToast type="mint" onClose={onClose} {...params} />;
  };
