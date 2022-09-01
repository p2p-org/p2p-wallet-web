import { action, makeObservable, observable } from 'mobx';
import { last } from 'ramda';
import { singleton } from 'tsyringe';

import type { ModalType } from './types';

export type ModalState = { modalType: ModalType; modalId: number; props: any };

export interface ModalServiceType {
  openModal: <T, S extends {}>(modalType: ModalType, props?: S) => Promise<T | void>; // TODO: right return type
  closeModal: <T>(modalId: number, result?: T) => T | void; // TODO: right return type
  closeTopModal: () => void;
}

@singleton()
export class ModalService implements ModalServiceType {
  modals: ModalState[] = [];
  private _modalIdCounter = 0;
  private _promises = new Map();

  constructor() {
    makeObservable(this, {
      modals: observable,

      openModal: action,
      closeModal: action,
      closeTopModal: action,
    });
  }

  // TODO: change order of types
  openModal<T, S extends {}>(modalType: ModalType, props?: S): Promise<T | void> {
    ++this._modalIdCounter;

    this.modals.push({
      modalType,
      modalId: this._modalIdCounter,
      props,
    });

    const promise = new Promise<T>((resolve) => {
      this._promises.set(this._modalIdCounter, {
        modalId: this._modalIdCounter,
        resolve,
      });
    });

    // @ts-ignore
    promise.modalId = this._modalIdCounter;

    return promise;
  }

  closeModal<T>(modalId: number, result?: T): T | void {
    this.modals = this.modals.filter((modal) => modal.modalId !== modalId);

    const dialogInfo = this._promises.get(modalId);
    if (dialogInfo) {
      dialogInfo.resolve(result);
      this._promises.delete(modalId);
    }

    return result;
  }

  closeTopModal(): void {
    if (this.modals.length === 0) {
      return;
    }

    this.closeModal(last(this.modals)!.modalId);
  }
}
