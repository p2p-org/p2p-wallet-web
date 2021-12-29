import { NotifyToast } from 'components/common/NotifyToast';
import { ToastManager } from 'components/common/ToastManager';

type TransferParams = {
  header: string;
  text: string;
  status?: 'processing' | 'success' | 'error';
  symbol?: string;
  symbolB?: string;
};

export const transferNotification = (params: TransferParams) => {
  ToastManager.show(({ onClose }) => <NotifyToast type="transfer" onClose={onClose} {...params} />);
};

export const swapNotification = (params: TransferParams) => {
  ToastManager.show(({ onClose }) => <NotifyToast type="swap" onClose={onClose} {...params} />);
};
