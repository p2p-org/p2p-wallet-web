import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { APIFactory } from 'api/token';
import { SerializableToken } from 'api/token/Token';
import { ToastManager } from 'components/common/ToastManager';
import { RootState } from 'store/rootReducer';
import { isFulfilledAction, isPendingAction, isRejectedAction } from 'utils/redux';

export interface GlobalState {
  loading: number;
  error: string | null;
  availableTokens: Array<SerializableToken>;
}

const initialState: GlobalState = {
  loading: 0,
  error: null,
  availableTokens: [],
};

export const GLOBAL_SLICE_NAME = 'global';

/**
 * Fetch all available tokens.
 */
export const getAvailableTokens = createAsyncThunk(
  `${GLOBAL_SLICE_NAME}/getAvailableTokens`,
  async (arg, thunkAPI): Promise<Array<SerializableToken>> => {
    const {
      wallet: { cluster },
    } = thunkAPI.getState() as RootState;

    const tokenAPI = APIFactory(cluster);
    const tokens = await tokenAPI.getTokens();
    return tokens.map((token) => token.serialize());
  },
);

const globalSlice = createSlice({
  name: GLOBAL_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAvailableTokens.fulfilled, (state, action) => ({
      ...state,
      availableTokens: action.payload,
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

export default globalSlice.reducer;
