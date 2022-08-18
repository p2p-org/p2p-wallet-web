export type Listener<Params extends unknown[] = []> = (...params: Params) => void;

export interface Unsubscribe {
  (): void;
}

export declare class Emitter<Params extends unknown[] = []> {
  /**
   * Array with listeners.
   *
   * ```js
   * emitter1.listeners = emitter2.listeners
   * emitter2.listeners = []
   * ```
   */
  listeners: Listener<Params>[];

  /**
   * Add a listener.
   *
   * ```js
   * const unbind = ee.on((tickType, tickDuration) => {
   *   count += 1
   * })
   *
   * disable () {
   *   unbind()
   * }
   * ```
   *
   * @param cb The listener function.
   * @returns Unbind listener from event.
   */
  on(this: this, cb: Listener<Params>): Unsubscribe;

  /**
   * Calls each of the listeners.
   *
   * ```js
   * ee.emit(tickType, tickDuration)
   * ```
   *
   * @param args The arguments for listeners.
   */
  emit(this: this, ...args: Params): void;
}

/**
 * Create event emitter.
 *
 * ```js
 * import { createNanoEvent } from 'nanoevent'
 *
 * class Ticker {
 *   constructor() {
 *     this.emitter = createNanoEvent()
 *   }
 *   on(...args) {
 *     return this.emitter.on(...args)
 *   }
 *   tick() {
 *     this.emitter.emit()
 *   }
 * }
 * ```
 */
export function createNanoEvent<Params extends unknown[] = []>(): Emitter<Params>;
