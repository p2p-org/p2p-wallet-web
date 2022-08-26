import { ObservableReactionContainer } from 'new/core/ObservableReactionContainer';

export abstract class ViewModel extends ObservableReactionContainer {
  protected override onEnd() {
    super.onEnd();

    this._setDefaults();
  }

  protected abstract _setDefaults(): void;
}
