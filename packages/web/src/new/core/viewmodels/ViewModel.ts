import { nanoid } from 'nanoid';

import { ObservableReactionContainer } from '../ObservableReactionContainer';

export abstract class ViewModel extends ObservableReactionContainer {
  readonly id = nanoid(10);
}
