/**
 * Perhaps taking Single Responsibility to far, this object encapsulates the logic of
 * creating or retrieving an object that is attached to a "Global Context", which is Window or
 * globalThis depending on the environment
 */
import { get, keys, set } from 'lodash';
import { nanoid } from 'nanoid';

export interface Injectable<T> {
  new (): T;
}

export interface InjectableWithArgs<T> {
  new (...args: any[]): T;
}

export type InjectCtor<T> = Injectable<T> | InjectableWithArgs<T>;

export interface Contextable {
  isSSR: boolean;
}

export class GlobalContextService implements Contextable {
  isSSR = false;

  globalContext: any;

  private static _instance: GlobalContextService;

  static readonly STATIC_CONTEXT_ID = nanoid(5);
  static readonly GLOBAL_CONTEXTS_ID = '__S_a_GlobalContextStore';

  objectsStored = new Array<string>();

  constructor() {
    const isWindowDefined = typeof window !== 'undefined';
    const isGlobalDefined = typeof global !== 'undefined';

    if (!isGlobalDefined && !isWindowDefined) {
      throw new Error(
        `${GlobalContextService.STATIC_CONTEXT_ID}; Unknown environment: Global is undefined and Window is undefined `,
      );
    }

    this.globalContext = isWindowDefined ? window : global;
    // TODO: @todo: for production, we should use STATIC_CONTEXT_ID
    // but it's nice to have ta standard one in dev so we can easily get find it
    // in the debugger
    set(this.globalContext, GlobalContextService.GLOBAL_CONTEXTS_ID, this);
    this.isSSR = !isWindowDefined;
  }

  static Get(): GlobalContextService {
    if (!GlobalContextService._instance) {
      const gcs = GlobalContextService.Find<GlobalContextService>(
        GlobalContextService.GLOBAL_CONTEXTS_ID,
      );
      GlobalContextService._instance = gcs ?? new GlobalContextService();
    }
    return GlobalContextService._instance;
  }

  static SetDebug(val: boolean): void {
    GlobalContextService.PutInGlobal('__RK_DEBUG', val);
  }

  static GetDebug(): boolean {
    return GlobalContextService.FindInGlobal('__RK_DEBUG') ?? false;
  }

  protected static Find<T>(key: string): T {
    const isWindowDefined = typeof window !== 'undefined';
    const isGlobalDefined = typeof global !== 'undefined';
    if (isWindowDefined) {
      return get(window, key);
    }
    if (isGlobalDefined) {
      return get(global, key);
    }

    throw new Error('Environment does not provide a valid global context');
  }

  static FindInGlobal<T>(key: string): T | null {
    const globalContextStore = GlobalContextService.Get();
    return get(globalContextStore.globalContext, key);
  }

  static PutInGlobal<T>(key: string, obj: T): T {
    const globalContextStore = GlobalContextService.Get();
    set(globalContextStore.globalContext, key, obj);
    globalContextStore.objectsStored.push(key);
    if (obj && keys(obj).includes('isSSR')) {
      set(obj as any, 'isSSR', globalContextStore.isSSR);
    }
    if (obj && keys(obj).includes('context')) {
      const { context = '' } = obj as any;
      set(globalContextStore.globalContext, `${key}_${context}`, obj);
    }
    return obj;
  }

  static RemoveFromGlobal(key: string): void {
    const globalContextStore = GlobalContextService.Get();
    set(globalContextStore.globalContext, key, null);
  }

  static RemoveAllFromGlobal(): void {
    const globalContextStore = GlobalContextService.Get();
    globalContextStore.objectsStored.forEach((objectName) => {
      GlobalContextService.RemoveFromGlobal(objectName);
    });
    globalContextStore.objectsStored = new Array<string>();
  }
}

export function FindOrCreateInGlobal<T extends Contextable>(
  key: string,
  creator: Injectable<T>,
): T {
  const { FindInGlobal, PutInGlobal } = GlobalContextService;
  const instance = FindInGlobal<T>(key) ?? PutInGlobal(key, new creator());
  return instance;
}

export function GetDebug(): boolean {
  return GlobalContextService.GetDebug();
}
