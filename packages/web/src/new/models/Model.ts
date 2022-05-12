import { nanoid } from 'nanoid';

import { ObservableReactionContainer } from '../core/ObservableReactionContainer';

export abstract class Model extends ObservableReactionContainer {
  protected id = nanoid(10);
}
