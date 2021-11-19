import { createAction, createSlice } from '@reduxjs/toolkit';

import { ToastManager } from 'components/common/ToastManager';
import { isFulfilledAction, isPendingAction, isRejectedAction } from 'utils/redux';

export const STORAGE_KEY_FEATURES_FLAGS = 'all_features';

export interface GlobalState {
  loading: number;
  error: string | null;
  featureFlagsEnabled: boolean;
}

const initialState: GlobalState = {
  loading: 0,
  error: null,
  featureFlagsEnabled: Boolean(localStorage.getItem(STORAGE_KEY_FEATURES_FLAGS)) || false,
};

export const GLOBAL_SLICE_NAME = 'global';

export const wipeAction = createAction('wipeAction');

export const setFeatureFlagsAction = createAction<boolean>('setFeatureFlagsAction');

const globalSlice = createSlice({
  name: GLOBAL_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setFeatureFlagsAction, (state, action) => ({
      ...state,
      featureFlagsEnabled: action.payload,
    }));
    builder.addMatcher(isPendingAction, (state) => ({
      ...state,
      loading: state.loading + 1,
    }));
    builder.addMatcher(isRejectedAction, (state, action) => {
      ToastManager.error(action.error.message);
      console.error(action.error);
      return {
        ...state,
        loading: Math.max(state.loading - 1, 0),
        error: action.error.message,
      };
    });
    builder.addMatcher(isFulfilledAction, (state) => ({
      ...state,
      loading: Math.max(state.loading - 1, 0),
    }));
  },
});

// eslint-disable-next-line import/no-default-export
export default globalSlice.reducer;
