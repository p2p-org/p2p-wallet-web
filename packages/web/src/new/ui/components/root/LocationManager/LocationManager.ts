import { useLayoutEffect } from 'react';
import { useHistory } from 'react-router';

import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { LocationManagerViewModel } from './LocationManager.ViewModel';

export const LocationManager = () => {
  const viewModel = useViewModel<LocationManagerViewModel>(LocationManagerViewModel);

  const history = useHistory();

  useLayoutEffect(() => viewModel.setHistory(history), [history]);

  return null;
};
