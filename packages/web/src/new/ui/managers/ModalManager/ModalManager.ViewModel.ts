import { computed, makeObservable } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { ModalServiceType, ModalType } from 'new/services/ModalService';
import { ModalService } from 'new/services/ModalService';

export type ModalManagerViewModelType = ModalServiceType;

@singleton()
export class ModalManagerViewModel extends ViewModel implements ModalManagerViewModelType {
  constructor(private _modalService: ModalService) {
    super();

    makeObservable(this, {
      modals: computed,
    });
  }

  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  get modals() {
    return this._modalService.modals;
  }

  openModal<T, S extends {}>(modalType: ModalType, props?: S): Promise<T | void> {
    return this._modalService.openModal<T, S>(modalType, props);
  }

  closeModal<T>(modalId: number, result?: T): T | void {
    return this._modalService.closeModal<T>(modalId, result);
  }

  closeTopModal() {
    this._modalService.closeTopModal();
  }
}
