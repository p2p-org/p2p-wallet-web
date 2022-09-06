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
// const HIDE_LEAVE_TIMEOUT = 5000;

@singleton()
export class NotificationService {
  currentToasts: CurrentToastParams[] = [];
  _delayedQueue: ToastParams[] = [];

  _hideTimeouts: number[] = [];
  _clearingTimeouts: number[] = [];
  _lastId = 0;

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

  private _setToastHideTimeout(id: number): void {
    const timeoutId = window.setTimeout(() => {
      this._startToastsHiding(id);
    }, HIDE_TIMEOUT);

    this._hideTimeouts.push(timeoutId);
  }

  private _startToastsHiding(ids: number | number[]) {
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

    this._clearingTimeouts.push(
      window.setTimeout(() => {
        this._removeToasts(idsArray);
      }, 400),
    );
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

    // if (!isHovered) {
    this._setToastHideTimeout(id);
    // }
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
