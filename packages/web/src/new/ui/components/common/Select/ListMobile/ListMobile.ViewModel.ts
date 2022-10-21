import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { ModalPromise, ModalType } from 'new/services/ModalService';
import { ModalService } from 'new/services/ModalService';

@singleton()
export class ListMobileViewModel extends ViewModel {
  constructor(private _modalService: ModalService) {
    super();
  }

  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  openModal<T>(modalType: ModalType, props: any): ModalPromise<T> {
    return this._modalService.openModal<T, any>(modalType, props);
  }

  closeModal<T>(modalId: number, result?: T): T | void {
    return this._modalService.closeModal<T>(modalId, result);
  }
}
