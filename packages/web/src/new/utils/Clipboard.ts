import { ToastManager } from 'components/common/ToastManager';

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
