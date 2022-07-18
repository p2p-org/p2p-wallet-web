/**
 * Object which helps manage life cycle calls, should be the base class for items that deal with life cycles, such
 * as React view life cycle, or network life cycle class.
 */
export abstract class LifeCycleObject {
  protected initGuard = 0;

  initialize() {
    ++this.initGuard;
    if (this.initGuard > 1) {
      return;
    }

    this.onInitialize();
  }

  end() {
    --this.initGuard;
    if (this.initGuard > 0) {
      return;
    }
    this.initGuard = 0;
    this.onEnd();
  }

  protected abstract onInitialize(): void;
  protected abstract onEnd(): void;
}
