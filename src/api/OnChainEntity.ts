export abstract class OnChainEntity<T extends OnChainEntity<T>> {
  readonly lastUpdatedSlot: number;

  protected previous: T | undefined;

  protected constructor(currentSlot?: number, previous?: T) {
    this.lastUpdatedSlot = currentSlot || 0;
    this.previous = previous;
  }

  setPrevious(previous: T): void {
    this.previous = previous;
  }

  addToHistory(entity: T): void {
    entity.previous = this.previous;
    this.previous = entity;
  }

  getPrevious(): T | undefined {
    return this.previous;
  }
}
