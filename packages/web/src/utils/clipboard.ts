import { ToastManager } from 'components/common/ToastManager';

// @return Promise<boolean>
export const askClipboardWritePermission = async () => {
  try {
    // The clipboard-write permission is granted automatically to pages
    // when they are the active tab. So it's not required, but it's more safe.
    const { state } = await navigator.permissions.query({ name: 'clipboard-write' });
    return state === 'granted';
  } catch {
    // Browser compatibility / Security error (ONLY HTTPS) ...
    return false;
  }
};

// Promise is needed for Safari. But Chrome also can work with such flow
export const setToClipboard = async (qrElement: HTMLCanvasElement, callback: () => void) => {
  try {
    const data = [
      new ClipboardItem({
        'image/png': new Promise((resolve) => {
          qrElement.toBlob((blob: Blob | null) => {
            if (blob) {
              resolve(blob);
            } else {
              ToastManager.error(`Can't copy to clipboard`);
            }
          });
        }),
      }),
    ];
    await navigator.clipboard.write(data);

    if (typeof callback === 'function') {
      callback();
    }
  } catch (error) {
    ToastManager.error((error as Error).message);
  }
};
