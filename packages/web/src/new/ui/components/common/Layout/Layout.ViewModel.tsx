import { computed, makeObservable } from 'mobx';
import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { ModalService, ModalType } from 'new/services/ModalService';
import { SolanaService } from 'new/services/SolanaService';

@injectable()
export class LayoutViewModel extends ViewModel {
  constructor(private _modalService: ModalService, private _solanaService: SolanaService) {
    super();

    makeObservable(this, {
      walletConnected: computed,
    });
  }

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  get walletConnected() {
    return !!this._solanaService.provider;
  }

  openActionsMobileModal() {
    void this._modalService.openModal(ModalType.SHOW_MODAL_ACTIONS_MOBILE, {
      layoutViewModel: this,
    });
  }

  openChooseBuyTokenMobileModal() {
    void this._modalService.openModal(ModalType.SHOW_MODAL_CHOOSE_BUY_TOKEN_MOBILE);
  }

  closeTopModal() {
    this._modalService.closeTopModal();
  }
}
