import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { NotificationService } from 'new/services/NotificationService';
import { copyImageToClipboard, copyStringToClipboard } from 'new/utils/Clipboard';

@singleton()
export class UserNamedAddressWidgetViewModel extends ViewModel {
  constructor(private _notificationService: NotificationService) {
    super();
  }

  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  copyString(value: string, text: string): void {
    void copyStringToClipboard(
      value,
      () => this._notificationService.info(`${text} copied!`),
      (error: Error) => console.error(error),
    );
  }

  copyQRCode(qrElement: HTMLCanvasElement): void {
    void copyImageToClipboard(
      qrElement,
      () => this._notificationService.info('QR code Copied!'),
      (err: Error) => this._notificationService.error(err.message),
    );
  }
}
