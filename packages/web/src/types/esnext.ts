/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/** @template T - Array item type */
interface Array<T> {
  /**
   * Takes an integer value and returns the item at that index, allowing for
   * positive and negative integers. Negative integers count back from the last
   * item in the array.
   *
   * @param {number} index - Position of the array element to be returned
   * @return {T | undefined} Element in the array matching the given index.
   * Returns `undefined` if the given index can not be found
   */
  at(index: number): T | undefined;
}

/** @template T - Array item type */
interface ReadonlyArray<T> {
  at: Array<T>['at'];
}
