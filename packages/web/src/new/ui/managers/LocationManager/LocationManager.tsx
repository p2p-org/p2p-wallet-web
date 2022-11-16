import { useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { LocationManagerViewModel } from './LocationManager.ViewModel';

export const LocationManager = () => {
  const viewModel = useViewModel(LocationManagerViewModel);

  const navigate = useNavigate();
  const location = useLocation();

  useLayoutEffect(() => viewModel.setNavigate(navigate), [navigate]);
  useLayoutEffect(() => viewModel.setLocation(location), [location]);

  return null;
};
