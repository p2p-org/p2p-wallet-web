import { computed, makeObservable } from 'mobx';
import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { SolanaModel } from 'new/models/SolanaModel';
import type { ModalType } from 'new/services/ModalService';
import { ModalService } from 'new/services/ModalService';

@injectable()
export class LayoutViewModel extends ViewModel {
  constructor(private _modalService: ModalService, private _solanaModel: SolanaModel) {
    super();

    makeObservable(this, {
      walletConnected: computed,
    });
  }

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  get walletConnected() {
    return !!this._solanaModel.provider;
  }

  openModal<T, S>(modalType: ModalType, props?: S): Promise<T | void> {
    return this._modalService.openModal<T, S>(modalType, props);
  }
}
