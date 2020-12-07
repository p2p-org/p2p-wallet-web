import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { APIFactory } from 'api/rate';
import { SerializableRate } from 'api/rate/Rate';
import { RootState } from 'store/rootReducer';

const RATES_SLICE_NAME = 'rates';

export const getRates = createAsyncThunk(
  `${RATES_SLICE_NAME}/getRates`,
  async (_, thunkAPI): Promise<Array<SerializableRate>> => {
    const state: RootState = thunkAPI.getState() as RootState;

    const PoolAPI = APIFactory(state.wallet.cluster);
    const rates = await PoolAPI.getRates();

    return rates.map((rate) => rate.serialize());
  },
);

interface RatesState {
  [pair: string]: number;
}

const initialState: RatesState = {};

const transactionSlice = createSlice({
  name: RATES_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getRates.fulfilled, (state, action) => {
      action.payload.forEach((rate) => {
        // eslint-disable-next-line no-param-reassign
        state[rate.market] = rate.price;
      });
    });
  },
});

// eslint-disable-next-line import/no-default-export
export default transactionSlice.reducer;
