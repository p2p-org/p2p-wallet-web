// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-param-reassign */
import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { APIFactory } from 'api/rate';
import { CandleLimitType, SerializableCandleRate } from 'api/rate/CandleRate';
import { SerializableMarketRate } from 'api/rate/MarketRate';
import { RootState } from 'store/rootReducer';
import { wipeAction } from 'store/slices/GlobalSlice';

const RATES_SLICE_NAME = 'rates';

export const getRatesMarkets = createAsyncThunk<SerializableMarketRate[]>(
  `${RATES_SLICE_NAME}/getRatesMarkets`,
  async (_, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;

    const RateAPI = APIFactory(state.wallet.network);
    const rates = await RateAPI.getRatesMarkets();

    return rates.map((rate) => rate.serialize());
  },
);

export const getRatesCandle = createAsyncThunk<
  SerializableCandleRate[],
  { symbol: string; type: CandleLimitType }
>(`${RATES_SLICE_NAME}/getRatesCandle`, async (args, thunkAPI) => {
  const state: RootState = thunkAPI.getState() as RootState;

  const PoolAPI = APIFactory(state.wallet.network);
  const rates = await PoolAPI.getRatesCandle(args.symbol, args.type);

  return rates.map((rate) => rate.serialize());
});

export const changeCandlesType = createAction<CandleLimitType>('changeCandlesType');

type CandleRate = {
  price: number;
  startTime: number;
};

export interface RatesState {
  candlesType: CandleLimitType;
  candles: {
    [pair: string]: CandleRate[];
  };
  markets: {
    [pair: string]: number;
  };
}

const initialState: RatesState = {
  candlesType: 'month',
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
      state.candles[action.meta.arg.symbol] = [];

      action.payload
        .sort((a, b) => a.startTime - b.startTime)
        .forEach((rate) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          state.candles[action.meta.arg.symbol].push({
            price: rate.price,
            startTime: rate.startTime,
          });
        });
    });
    builder.addCase(getRatesCandle.rejected, (state, action) => {
      state.candles[action.meta.arg.symbol] = [];
    });
    builder.addCase(changeCandlesType, (state, action) => {
      state.candlesType = action.payload;
    });
    builder.addCase(wipeAction, () => initialState);
  },
});

// eslint-disable-next-line import/no-default-export
export default transactionSlice.reducer;
