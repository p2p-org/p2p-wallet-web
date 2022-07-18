import { LifeCycleObject } from './LifeCycleObject';

describe('LifeCycleObject should work as expected', function () {
  it('LifeCycleObject should call onInitialize and onEnd once for the life of the object', () => {
    class TestObject extends LifeCycleObject {
      timesInitWasCalled = 0;
      timesEndWasCalled = 0;

      protected onInitialize(): void {
        this.timesInitWasCalled++;
      }
      protected onEnd(): void {
        this.timesEndWasCalled++;
      }
    }

    const testObject = new TestObject();
    for (let i = 0; i < 10; i++) {
      testObject.initialize();
    }
    expect(testObject.timesInitWasCalled, 'onInitialize should only have been called once').toBe(1);

    for (let i = 0; i < 10; i++) {
      testObject.end();
    }
    expect(testObject.timesEndWasCalled, 'onEnd should only have been called once').toBe(1);
  });
});
