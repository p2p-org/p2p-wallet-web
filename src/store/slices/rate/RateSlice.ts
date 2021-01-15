// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { APIFactory } from 'api/rate';
import { SerializableCandleRate } from 'api/rate/CandleRate';
import { SerializableMarketRate } from 'api/rate/MarketRate';
import { RootState } from 'store/rootReducer';

const RATES_SLICE_NAME = 'rates';

export const getMarketsRates = createAsyncThunk<SerializableMarketRate[]>(
  `${RATES_SLICE_NAME}/getMarketsRates`,
  async (_, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;

    const RateAPI = APIFactory(state.wallet.cluster);
    const rates = await RateAPI.getMarketsRates();

    return rates.map((rate) => rate.serialize());
  },
);

export const getCandleRates = createAsyncThunk<SerializableCandleRate[], string>(
  `${RATES_SLICE_NAME}/getCandleRates`,
  async (arg, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;

    const PoolAPI = APIFactory(state.wallet.cluster);
    const rates = await PoolAPI.getCandleRates(arg);

    return rates.map((rate) => rate.serialize());
  },
);

export interface RatesState {
  candles: {
    [pair: string]: {
      price: number;
      startTime: number;
    }[];
  };
  markets: {
    [pair: string]: number;
  };
}

const initialState: RatesState = {
  candles: {},
  markets: {},
};

const transactionSlice = createSlice({
  name: RATES_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getMarketsRates.fulfilled, (state, action) => {
      action.payload.forEach((rate) => {
        state.markets[rate.market] = rate.price;
      });
    });
    builder.addCase(getCandleRates.fulfilled, (state, action) => {
      action.payload
        .sort((a, b) => a.startTime - b.startTime)
        .forEach((rate) => {
          if (!state.candles[rate.market]) {
            state.candles[rate.market] = [];
          }

          state.candles[rate.market].push({
            price: rate.price,
            startTime: rate.startTime,
          });
        });
    });
    builder.addCase(getCandleRates.rejected, (state, action) => {
      state.candles[`${action.meta.arg}/USDT`] = [];
    });
  },
});

// eslint-disable-next-line import/no-default-export
export default transactionSlice.reducer;
