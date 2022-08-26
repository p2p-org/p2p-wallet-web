import { useEffect, useState } from 'react';
import { useIsomorphicLayoutEffect } from 'react-use';

import { clone, get, hasIn, isEmpty, set } from 'lodash';
import { nanoid } from 'nanoid';
import type { DependencyContainer } from 'tsyringe';
import { instanceCachingFactory } from 'tsyringe';
import type constructor from 'tsyringe/dist/typings/types/constructor';

import DependencyService from 'new/services/injection/DependencyService';

import type { ViewModel } from './ViewModel';

const mountCountKey = '__RK_mountCount';
const reactInitKey = '__RK_initKey';

export const hasReactInitKey = (vm: ViewModel): boolean => {
  return hasIn(vm, reactInitKey) && !isEmpty(get(vm, reactInitKey));
};

export const getReactInitKey = (vm: ViewModel) => {
  const val = get(vm, reactInitKey);
  return val ? clone(val) : null;
};

export const setReactInitKey = (vm: ViewModel) => {
  set(vm, reactInitKey, nanoid());
};

export const removeReactInitKey = (vm: ViewModel) => {
  set(vm, reactInitKey, null);
};

export const getMountCount = (obj: ViewModel): number => {
  return hasIn(obj, mountCountKey) ? get(obj, mountCountKey) : 0;
};

export const setMountCount = (obj: ViewModel, val: number): void => {
  set(obj, mountCountKey, val);
};

export const incrementMountCount = (obj: ViewModel): number => {
  let mountCount = getMountCount(obj);
  ++mountCount;
  setMountCount(obj, mountCount);
  return mountCount;
};

export const decrementMountCount = (obj: ViewModel): number => {
  let mountCount = getMountCount(obj);
  // limit mount count at zero
  mountCount = Math.max(0, mountCount - 1);
  setMountCount(obj, mountCount);
  return mountCount;
};

export const useViewModel = <T extends ViewModel>(token: constructor<T>) => {
  let vm = DependencyService.resolveSafe(token) as T;
  if (!vm) {
    DependencyService.container().register(token, {
      useFactory: instanceCachingFactory((dependencyContainer: DependencyContainer) => {
        return new token();
      }),
    });
    vm = DependencyService.resolve(token);
  }

  const [viewModel] = useState(vm);

  /**
   * Yes, this does have side effects if the initialization code does things
   * like fetch data, or spawn web workers.
   *
   * However, the ease of use in the component outweighed the side effect to me.
   *
   * @todo consider adding a 'onMountOnce' and 'onUnmountOnce' method to
   * ViewModels to allow for better handling of side effects.
   */
  if (!hasReactInitKey(viewModel)) {
    setReactInitKey(viewModel);
    viewModel.initialize();
  }

  useIsomorphicLayoutEffect(() => {
    // viewModel.onLayoutEffect();
    return () => {
      // viewModel.onLayoutEffectUnmount();
    };
  }, []);

  useEffect(() => {
    incrementMountCount(viewModel);
    // viewModel.onEffect();
    return () => {
      decrementMountCount(viewModel);
      // viewModel.onEffectUnmount();
      if (getMountCount(viewModel) === 0) {
        viewModel.end();
        removeReactInitKey(viewModel);
      }
    };
  }, []);

  return viewModel;
};
