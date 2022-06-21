import { nanoid } from 'nanoid';

import { ObservableReactionContainer } from '../ObservableReactionContainer';

export abstract class Model extends ObservableReactionContainer {
  protected id = nanoid(10);
}
