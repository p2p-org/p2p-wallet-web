import { computed, makeObservable } from 'mobx';
import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { SolanaModel } from 'new/models/SolanaModel';
import { ModalService, ModalType } from 'new/services/ModalService';

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

  openActionsMobileModal() {
    void this._modalService.openModal(ModalType.SHOW_MODAL_ACTIONS_MOBILE, {
      layoutViewModel: this,
    });
  }

  openChooseBuyTokenMobileModal() {
    void this._modalService.openModal(ModalType.SHOW_MODAL_CHOOSE_BUY_TOKEN_MOBILE);
  }
}
