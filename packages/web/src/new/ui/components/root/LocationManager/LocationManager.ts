import { useEffect } from 'react';
import { useHistory } from 'react-router';

import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { LocationManagerViewModel } from './LocationManager.ViewModel';

export const LocationManager = () => {
  const viewModel = useViewModel<LocationManagerViewModel>(LocationManagerViewModel);

  const history = useHistory();

  useEffect(() => viewModel.setHistory(history), [history]);

  return null;
};
