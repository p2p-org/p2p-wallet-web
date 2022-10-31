import { browserName, BrowserNames } from 'new/utils/UserAgent';

export const isImageCopyAvailable = browserName !== BrowserNames.FIREFOX;

export const copyStringToClipboard = async (
  str: string,
  callback: () => void,
  errorCallback?: (err: Error) => void,
) => {
  try {
    await navigator.clipboard.writeText(str);
    callback && callback();
  } catch (error) {
    errorCallback && errorCallback(error as Error);
  }
};

// Promise is needed for Safari. But Chrome also can work with such flow
export const copyImageToClipboard = async (
  qrElement: HTMLCanvasElement,
  callback: () => void,
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

    callback && callback();
  } catch (error) {
    errorCallback && errorCallback(error as Error);
  }
};
