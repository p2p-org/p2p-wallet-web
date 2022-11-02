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
  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number;
}

/** @template T - Array item type */
interface ReadonlyArray<T> {
  at: Array<T>['at'];
  findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number;
}
