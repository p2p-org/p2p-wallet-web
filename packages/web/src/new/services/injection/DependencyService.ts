import '@abraham/reflection';

import { get, hasIn, isFunction, isString, memoize, set } from 'lodash';
import type { DependencyContainer, InjectionToken } from 'tsyringe';
import { container, Lifecycle } from 'tsyringe';
import type constructor from 'tsyringe/dist/typings/types/constructor';

import { GlobalContextService } from './GlobalContextService';

// TODO: deal with server vs client side context here

function getContainer(): DependencyContainer {
  let globalContainer = GlobalContextService.FindInGlobal(
    '__RK_Global_Container',
  ) as DependencyContainer;
  if (!globalContainer) {
    globalContainer = container;
    GlobalContextService.PutInGlobal('__RK_Global_Container', globalContainer);
  }
  return globalContainer;
}

const globalContainer = memoize(getContainer);

const _container = globalContainer();

function debugPrintContainer(): void {
  const map = get(_container, '_registry._registryMap') as Map<any, any>;
  map.forEach((value) => {
    console.log('obj: ', get(value[0], 'instance'));
  });
}

if (!GlobalContextService.Get().isSSR) {
  set(window, '__RK_printContainer', debugPrintContainer);
}

export class DependencyService {
  static registerValue<T>(token: InjectionToken<T>, value: T): DependencyContainer {
    return _container.register(token, { useValue: value });
  }

  static registerSingleton<T>(token: InjectionToken<T>): DependencyContainer {
    if (!isFunction(token)) {
      throw new Error(`{token} must be a function`);
    }
    return _container.registerSingleton(token as unknown as constructor<T>);
  }

  static registerAsSingleton<T>(from: InjectionToken<T>, to: InjectionToken<T>): DependencyService {
    return _container.registerSingleton(from, to);
  }

  static registerClass<T>(token: constructor<T>): DependencyContainer {
    return _container.register(token, { useClass: token }, { lifecycle: Lifecycle.Transient });
  }

  static resolve<T>(token: InjectionToken<T>): T {
    const t = _container.resolve(token);
    if (GlobalContextService.GetDebug() && hasIn(t, 'id')) {
      const name = isString(token) ? token : token.toString().substring(0, 25);
      console.log(`~~~~ Resolving: ${name} with id: ${get(t, 'id')}`);
    }
    return t;
  }

  static resolveSafe<T>(token: InjectionToken<T>): T | null {
    if (isFunction(token)) {
      return DependencyService.resolve(token);
    }

    return _container.isRegistered(token) ? DependencyService.resolve(token) : null;
  }

  static container(): DependencyContainer {
    return _container;
  }

  static isRegistered<T>(token: InjectionToken<T>): boolean {
    return _container.isRegistered(token);
  }
}

export const useDependency = <T>(token: InjectionToken<T>): T | null => {
  return DependencyService.resolveSafe(token);
};

export default DependencyService;
