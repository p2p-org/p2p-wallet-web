import '@abraham/reflection';

import React, { useContext } from 'react';

import type { DependencyContainer, InjectionToken } from 'tsyringe';
import { container, Lifecycle } from 'tsyringe';
import type constructor from 'tsyringe/dist/typings/types/constructor';

// TODO: deal with server vs client side context here
//export const DependencyService = container;

export class DependencyService {
  static registerValue<T>(token: InjectionToken<T>, value: T): DependencyContainer {
    return container.register(token, { useValue: value });
  }

  static registerSingleton<T>(token: constructor<T>): DependencyContainer {
    return container.registerSingleton(token);
  }

  static registerAsSingleton<T>(from: InjectionToken<T>, to: InjectionToken<T>): DependencyService {
    return container.registerSingleton(from, to);
  }

  static registerClass<T>(token: constructor<T>): DependencyContainer {
    return container.register(token, { useClass: token }, { lifecycle: Lifecycle.Transient });
  }

  static resolve<T>(token: InjectionToken<T>): T {
    return container.resolve(token);
  }

  static container(): DependencyContainer {
    return container;
  }
}

const DependencyContext = React.createContext<DependencyContainer>(container);

export const useDependency = <T>(token: InjectionToken<T>) => {
  const container = useContext(DependencyContext);
  return container.resolve(token);
};

export const useDependencyContainer = (): DependencyContainer => {
  return DependencyService.container();
};

export default DependencyContext;
