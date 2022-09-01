import { runInAction } from 'mobx';

import { ObservableReactionContainer } from '../ObservableReactionContainer';

export abstract class ViewModel extends ObservableReactionContainer {
  protected override onEnd() {
    super.onEnd();

    runInAction(() => {
      this.setDefaults();
    });
  }

  protected abstract setDefaults(): void;
}
