import type { RefObject } from 'react';
import { createRef } from 'react';

import { computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { CurrentToastParams } from 'new/services/NotificationService/NotificationService';
import { NotificationService } from 'new/services/NotificationService/NotificationService';

type SizeType = Record<string, number>;
type ToastRefType = RefObject<HTMLDivElement>;

export type CurrentToastForRenderParams = CurrentToastParams & {
  bottomOffset: number;
  ref: ToastRefType;
};

@singleton()
export class NotificationManagerViewModel extends ViewModel {
  private _heights: SizeType;
  private _toastsRefs: Record<string, ToastRefType>;

  _bottomOffsets: SizeType;

  constructor(private _notificationService: NotificationService) {
    super();

    this._heights = {};
    this._bottomOffsets = {};
    this._toastsRefs = {};

    makeObservable(this, {
      _bottomOffsets: observable,
      currentToasts: computed,
    });
  }

  protected override setDefaults() {
    this._heights = {};
    this._toastsRefs = {};

    runInAction(() => (this._bottomOffsets = {}));
  }

  protected override onInitialize() {
    this.addReaction(
      reaction(
        () => this._notificationService.currentToasts,
        (currentToasts) => {
          setTimeout(() => this._checkHeights(currentToasts), 0);
        },
      ),
    );
  }

  protected override afterReactionsRemoved() {}

  private _checkHeights(currentToasts: CurrentToastParams[]): void {
    const newHeights: SizeType = {};
    let heightsUpdated = false;

    for (const id of Object.keys(this._toastsRefs)) {
      const ref = this._toastsRefs[id];

      if (ref?.current) {
        const foundToast = currentToasts.find((toast) => toast.id === Number(id));

        if (foundToast) {
          const height = foundToast.isHiding ? 0 : ref.current.clientHeight;

          newHeights[id] = height;

          if (this._heights[id] === undefined || this._heights[id] !== height) {
            heightsUpdated = true;
          }
        }
      }
    }

    if (heightsUpdated) {
      this._heights = newHeights;
      this._calcOffsets();
    }
  }

  private _calcOffsets() {
    const newBottomOffsets: SizeType = {};
    let totalOffset = 0;

    for (let i = this._notificationService.currentToasts.length - 1; i >= 0; i--) {
      const { id, isHiding } = this._notificationService.currentToasts[i] as CurrentToastParams;

      if (isHiding) {
        newBottomOffsets[id] = this._bottomOffsets[id] as number;
      } else {
        const height = this._heights[id];
        let bottomOffset;

        if (height) {
          bottomOffset = totalOffset;
          totalOffset += height;
        } else {
          bottomOffset = 0;
        }

        newBottomOffsets[id] = bottomOffset;
      }
    }

    runInAction(() => (this._bottomOffsets = newBottomOffsets));
  }

  get currentToasts(): CurrentToastForRenderParams[] {
    return this._notificationService.currentToasts.map((toast) => {
      this._toastsRefs[toast.id] = this._toastsRefs[toast.id] || createRef();

      return {
        ...toast,
        bottomOffset: this._bottomOffsets[toast.id] as number,
        ref: this._toastsRefs[toast.id] as ToastRefType,
      };
    });
  }
}
