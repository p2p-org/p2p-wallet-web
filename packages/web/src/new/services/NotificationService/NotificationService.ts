import { makeObservable, observable, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

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

@singleton()
export class NotificationService {
  currentToasts: CurrentToastParams[] = [];

  _delayedQueue: ToastParams[] = [];

  private _hideTimeouts: number[] = [];
  private _removeTimeouts: number[] = [];
  private _lastId = 0;

  private _noHide = false;

  constructor() {
    makeObservable(this, {
      currentToasts: observable,
    });

    window.service = this;
  }

  private _getActiveToastsCount(): number {
    return this.currentToasts.filter((toast) => !toast.isHiding).length;
  }

  private _addToast(toastParams: ToastParams): void {
    if (this._getActiveToastsCount() >= LIMIT) {
      this._delayedQueue = this._delayedQueue.concat(toastParams);
      return;
    }

    this._showToast(toastParams);
  }

  private _setToastHideTimeout(id: number, timeout = HIDE_TIMEOUT): void {
    const timerIdx = this._hideTimeouts.length;

    const timeoutId = window.setTimeout(() => {
      this._hideTimeouts.splice(timerIdx, 1);
      this.startToastsHiding(id);
    }, timeout);

    this._hideTimeouts.push(timeoutId);
  }

  startToastsHiding(ids: number | number[]) {
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

    this._checkDelayedQueue();

    const timerIdx = this._removeTimeouts.length;
    const timeoutId = window.setTimeout(() => {
      this._removeTimeouts.splice(timerIdx, 1);
      this._removeToasts(idsArray);
    }, 400);
    this._removeTimeouts.push(timeoutId);
  }

  private _removeToasts(ids: number[]): void {
    runInAction(() => {
      this.currentToasts = this.currentToasts.filter((toast) => !ids.includes(toast.id));
    });
  }

  private _checkDelayedQueue(): void {
    if (this._delayedQueue.length > 0 && this._getActiveToastsCount() < LIMIT) {
      const [firstToast, ...other] = this._delayedQueue;

      this._delayedQueue = other;

      this._showToast(firstToast!);

      this._checkDelayedQueue();
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

  eraseData(): void {
    this.currentToasts = [];
    this._delayedQueue = [];

    this._noHide = false;

    // clean timeouts
    for (const id of this._hideTimeouts) {
      clearTimeout(id);
    }

    for (const id of this._removeTimeouts) {
      clearTimeout(id);
    }

    this._hideTimeouts = [];
    this._removeTimeouts = [];
  }

  disableDeferredHiding(): void {
    this._noHide = true;

    for (const id of this._hideTimeouts) {
      clearTimeout(id);
    }
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
  }

  show(renderer: RendererType): void {
    this._addToast({ type: 'component', renderer });
  }
}
