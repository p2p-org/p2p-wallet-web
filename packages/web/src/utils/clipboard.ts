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

// @params blob - The ClipboardItem takes an object with the MIME type as key, and the actual blob as the value.
// @return Promise<void>
export const setToClipboard = async (blob: Blob | null) => {
  if (!blob) {
    ToastManager.error(`Can't copy to clipboard`);
    return;
  }

  try {
    const data = [new ClipboardItem({ [blob.type]: blob })];
    await navigator.clipboard.write(data);
  } catch (error) {
    ToastManager.error((error as Error).message);
  }
};

export const setToClipboard1 = async (qrElement: HTMLCanvasElement, callback: () => void) => {
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
