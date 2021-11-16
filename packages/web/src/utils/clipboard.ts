import { ToastManager } from 'components/common/ToastManager';

// @return Promise<boolean>
export const askClipboardWritePermission = async () => {
  try {
    // The clipboard-write permission is granted automatically to pages
    // when they are the active tab. So it's not required, but it's more safe.
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
    // @ts-ignore
    const data = [new ClipboardItem({ [blob.type]: blob })];
    // @ts-ignore
    await navigator.clipboard.write(data);
  } catch (error) {
    ToastManager.error((error as Error).message);
  }
};
