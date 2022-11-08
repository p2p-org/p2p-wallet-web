import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { NotificationService } from 'new/services/NotificationService';
import { copyToClipboardImage, copyToClipboardString } from 'new/utils/Clipboard';

@singleton()
export class UserNamedAddressWidgetViewModel extends ViewModel {
  constructor(private _notificationService: NotificationService) {
    super();
  }

  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  copyString(name: string, value: string, onSuccess?: () => void): void {
    void copyToClipboardString(
      value,
      () => {
        this._notificationService.info(`${name} copied!`);

        if (onSuccess) {
          onSuccess();
        }
      },
      (_: Error) => this._notificationService.error(`Can't copy ${value} to clipboard`),
    );
  }

  copyQRCode(qrElement: HTMLCanvasElement, onSuccess?: () => void): void {
    void copyToClipboardImage(
      qrElement,
      () => {
        this._notificationService.info('QR Code copied!');

        if (onSuccess) {
          onSuccess();
        }
      },
      (_: Error) => this._notificationService.error(`Can't copy QR Code to clipboard`),
    );
  }
}
