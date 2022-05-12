import { useContext, useEffect, useState } from 'react';

import type { DependencyContainer } from 'tsyringe';
import { instanceCachingFactory } from 'tsyringe';
import type constructor from 'tsyringe/dist/typings/types/constructor';

import DependencyContext from '../services/injection/DependencyContext';
import type { ViewModel } from './ViewModel';

export const useViewModel = <T extends ViewModel>(token: constructor<T>) => {
  const container = useContext(DependencyContext);
  const vm = container.resolve(token);
  if (!vm) {
    container.register(token, {
      useFactory: instanceCachingFactory((_dependencyContainer: DependencyContainer) => {
        return new token();
      }),
    });
  }

  const [viewModel] = useState(vm);

  viewModel.initialize();

  useEffect(() => {
    return () => {
      viewModel.end();
    };
  }, []);

  return viewModel;
};
