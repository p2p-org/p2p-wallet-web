// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { APIFactory } from 'api/rate';
import { SerializableCandleRate } from 'api/rate/CandleRate';
import { SerializableMarketRate } from 'api/rate/MarketRate';
import { RootState } from 'store/rootReducer';
import { wipeAction } from 'store/slices/GlobalSlice';

const RATES_SLICE_NAME = 'rates';

export const getRatesMarkets = createAsyncThunk<SerializableMarketRate[]>(
  `${RATES_SLICE_NAME}/getRatesMarkets`,
  async (_, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;

    const RateAPI = APIFactory(state.wallet.cluster);
    const rates = await RateAPI.getRatesMarkets();

    return rates.map((rate) => rate.serialize());
  },
);

export const getRatesCandle = createAsyncThunk<SerializableCandleRate[], string>(
  `${RATES_SLICE_NAME}/getRatesCandle`,
  async (arg, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;

    const PoolAPI = APIFactory(state.wallet.cluster);
    const rates = await PoolAPI.getRatesCandle(arg);

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
    builder.addCase(getRatesMarkets.fulfilled, (state, action) => {
      action.payload.forEach((rate) => {
        state.markets[rate.market] = rate.price;
      });
    });
    builder.addCase(getRatesCandle.fulfilled, (state, action) => {
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
    builder.addCase(getRatesCandle.rejected, (state, action) => {
      state.candles[`${action.meta.arg}/USD`] = [];
    });
    builder.addCase(wipeAction, () => initialState);
  },
});

// eslint-disable-next-line import/no-default-export
export default transactionSlice.reducer;
