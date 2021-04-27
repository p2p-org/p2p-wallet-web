import { ToastManager } from 'components/common/ToastManager';

// @return Promise<boolean>
export const askClipboardWritePermission = async () => {
  try {
    // The clipboard-write permission is granted automatically to pages
    // when they are the active tab. So it's not required, but it's more safe.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    const data = [new ClipboardItem({ [blob.type]: blob })];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await navigator.clipboard.write(data);
  } catch (error) {
    ToastManager.error((error as Error).message);
  }
};
