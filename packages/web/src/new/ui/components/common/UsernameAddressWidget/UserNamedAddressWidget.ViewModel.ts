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

  copyString(name: string, value: string, onSuccess?: () => void): void {
    void copyStringToClipboard(
      value,
      () => {
        this._notificationService.info(`${name} copied!`);

        if (onSuccess) {
          onSuccess();
        }
      },
      (error: Error) => console.error(error),
    );
  }

  copyQRCode(qrElement: HTMLCanvasElement, onSuccess?: () => void): void {
    void copyImageToClipboard(
      qrElement,
      () => {
        this._notificationService.info('QR code Copied!');

        if (onSuccess) {
          onSuccess();
        }
      },
      (err: Error) => this._notificationService.error(err.message),
    );
  }
}
