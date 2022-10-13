import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { ModalService, ModalType } from 'new/services/ModalService';
import { NotificationService } from 'new/services/NotificationService';
import { SolanaService } from 'new/services/SolanaService';

@singleton()
export class LayoutViewModel extends ViewModel {
  constructor(
    private _modalService: ModalService,
    private _solanaService: SolanaService,
    public notificationService: NotificationService,
  ) {
    super();
  }

  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  get walletConnected() {
    return !!this._solanaService.provider.wallet.publicKey;
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
