import { browserName, BrowserNames } from 'new/utils/UserAgent';

export const isImageCopyAvailable = browserName !== BrowserNames.FIREFOX;

export const copyToClipboardString = async (
  str: string,
  callback?: () => void,
  errorCallback?: (err: Error) => void,
) => {
  try {
    await navigator.clipboard.writeText(str);
    if (callback) {
      callback();
    }
  } catch (error) {
    if (errorCallback) {
      errorCallback(error as Error);
    }
  }
};

// Promise is needed for Safari. But Chrome also can work with such flow
export const copyToClipboardImage = async (
  qrElement: HTMLCanvasElement,
  callback?: () => void,
  errorCallback?: (err: Error) => void,
) => {
  try {
    const data = [
      new ClipboardItem({
        'image/png': new Promise((resolve, reject) => {
          qrElement.toBlob((blob: Blob | null) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(`Can't copy to clipboard`);
            }
          });
        }),
      }),
    ];
    await navigator.clipboard.write(data);

    if (callback) {
      callback();
    }
  } catch (error) {
    if (errorCallback) {
      errorCallback(error as Error);
    }
  }
};
