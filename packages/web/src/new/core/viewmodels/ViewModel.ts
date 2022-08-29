import { ObservableReactionContainer } from '../ObservableReactionContainer';

export abstract class ViewModel extends ObservableReactionContainer {
  protected override onEnd() {
    super.onEnd();

    this.setDefaults();
  }

  protected abstract setDefaults(): void;
}
