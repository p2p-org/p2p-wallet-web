import { makeAutoObservable, reaction } from 'mobx';

import {
  awaitReaction,
  delayedAction,
  ObservableReactionContainer,
} from './ObservableReactionContainer';

describe('ObservableReactionContainer should work as expected', function () {
  it('should handle and remove mobx reactions correctly', async () => {
    class ObservableObject {
      count = 0;
      constructor() {
        makeAutoObservable(this);
      }

      incrementCount() {
        this.count += 1;
      }
    }
    class TestReactionContainer extends ObservableReactionContainer {
      count = 0;
      objToObserve = new ObservableObject();
      protected onInitialize(): void {
        this.addReaction(
          reaction(
            () => this.objToObserve.count,
            () => (this.count = this.objToObserve.count),
          ),
        );
      }

      afterReactionsRemoved() {}
    }

    const testRC = new TestReactionContainer();
    testRC.initialize();
    expect(testRC.reactionsCount, 'Reactions Count should be 1').toBe(1);

    delayedAction(() => {
      testRC.objToObserve.incrementCount();
    }, 100);
    expect(testRC.count, 'Test RC count should still be zero').toBe(0);
    await awaitReaction(
      () => testRC.objToObserve.count,
      () => true,
    );
    expect(testRC.count, 'Test RC count should now be 1').toBe(1);

    testRC.end();
    expect(testRC.reactionsCount, 'Reactions Count should be 0').toBe(0);
    delayedAction(() => {
      testRC.objToObserve.incrementCount();
    }, 100);
    await awaitReaction(
      () => testRC.objToObserve.count,
      () => true,
    );
    expect(testRC.objToObserve.count, 'ObservableObj count should be 2').toBe(2);
    expect(testRC.count, 'Test RC count should still be 1').toBe(1);
  });
});
