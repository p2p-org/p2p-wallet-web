import { action, makeObservable } from 'mobx';

import { ObservableReactionContainer } from '../ObservableReactionContainer';

export abstract class ViewModel extends ObservableReactionContainer {
  constructor() {
    super();

    makeObservable<ViewModel, 'setDefaults'>(this, {
      setDefaults: action,
    });
  }

  protected override onEnd() {
    super.onEnd();

    this.setDefaults();
  }

  protected abstract setDefaults(): void;
}
