import { makeObservable, observable, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { trackEvent1 } from 'new/sdk/Analytics';
import type { RendererType } from 'new/ui/managers/NotificationManager/NotificationManager';

export type ToastType = 'info' | 'warn' | 'error' | 'component';

export type ToastParams = {
  type: string;
  header?: string;
  text?: string;
  renderer?: RendererType;
};

export type CurrentToastParams = { id: number; isHiding?: boolean } & ToastParams;

const LIMIT = 3;
const HIDE_TIMEOUT = 7000;
const HIDE_LEAVE_TIMEOUT = 5000;
const REMOVE_TIMEOUT = 400;

@singleton()
export class NotificationService {
  currentToasts: CurrentToastParams[] = [];

  private _queue: ToastParams[] = [];

  private _hideTimeouts: Set<number> = new Set();
  private _removeTimeouts: Set<number> = new Set();
  private _lastId = 0;

  private _noHide = false;

  constructor() {
    makeObservable(this, {
      currentToasts: observable,
    });
  }

  private _getActiveToastsCount(): number {
    return this.currentToasts.filter((toast) => !toast.isHiding).length;
  }

  private _addToast(toastParams: ToastParams): void {
    if (this._getActiveToastsCount() >= LIMIT) {
      this._queue = this._queue.concat(toastParams);
      return;
    }

    this._showToast(toastParams);
  }

  private _setToastHideTimeout(id: number, timeout = HIDE_TIMEOUT): void {
    const timeoutId = window.setTimeout(() => {
      this._hideTimeouts.delete(timeoutId);
      this.startToastsHiding(id);
    }, timeout);

    this._hideTimeouts.add(timeoutId);
  }

  private _removeToasts(ids: number[]): void {
    runInAction(() => {
      this.currentToasts = this.currentToasts.filter((toast) => !ids.includes(toast.id));
    });
  }

  private _checkQueue(): void {
    if (this._queue.length > 0 && this._getActiveToastsCount() < LIMIT) {
      const [firstToast, ...other] = this._queue;

      this._queue = other;

      this._showToast(firstToast!);

      this._checkQueue();
    }
  }

  private _showToast({ type, header, text, renderer }: ToastParams): void {
    this._lastId++;
    const id = this._lastId;

    runInAction(() => {
      this.currentToasts = this.currentToasts.concat({
        id,
        type,
        header,
        text,
        renderer,
      });
    });

    if (!this._noHide) {
      this._setToastHideTimeout(id);
    }
  }

  startToastsHiding(ids: number | number[]): void {
    let idsArray: number[];
    if (!Array.isArray(ids)) {
      idsArray = [ids];
    } else {
      idsArray = ids;
    }

    runInAction(() => {
      this.currentToasts = this.currentToasts.map((toast) => {
        if (idsArray.includes(toast.id)) {
          return {
            ...toast,
            isHiding: true,
          };
        }

        return toast;
      });
    });

    this._checkQueue();

    const timeoutId = window.setTimeout(() => {
      this._removeTimeouts.delete(timeoutId);
      this._removeToasts(idsArray);
    }, REMOVE_TIMEOUT);

    this._removeTimeouts.add(timeoutId);
  }

  eraseData(): void {
    runInAction(() => {
      this.currentToasts = [];
    });
    this._queue = [];

    this._noHide = false;

    // clean timeouts
    for (const id of this._hideTimeouts) {
      clearTimeout(id);
    }

    for (const id of this._removeTimeouts) {
      clearTimeout(id);
    }

    this._hideTimeouts.clear();
    this._removeTimeouts.clear();
  }

  disableDeferredHiding(): void {
    this._noHide = true;

    for (const id of this._hideTimeouts) {
      clearTimeout(id);
    }

    this._hideTimeouts.clear();
  }

  enableDeferredHiding(): void {
    this._noHide = false;

    if (this.currentToasts.length === 0) {
      return;
    }

    this.currentToasts.forEach(({ id }) => this._setToastHideTimeout(id, HIDE_LEAVE_TIMEOUT));
  }

  info(header: string, text?: string): void {
    this._addToast({ type: 'info', header, text });
  }

  warn(header: string, text?: string): void {
    this._addToast({ type: 'warn', header, text });
  }

  error(header: string, text?: string): void {
    this._addToast({ type: 'error', header, text });

    // track error
    if (!text) {
      text = header;
      header = '';
    }
    trackEvent1({
      name: 'Error_Showed',
      params: { Current_Screen: location.pathname, Code: header, Description: text },
    });
  }

  show(renderer: RendererType): void {
    this._addToast({ type: 'component', renderer });
  }
}
