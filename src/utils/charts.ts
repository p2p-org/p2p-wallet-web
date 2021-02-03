import dayjs from 'dayjs';
import { prop } from 'ramda';

const start: { [key: string]: number } = {
  BTC: 1282089600,
  ETH: 1438992000,
  BCH: 1500854400,
  XLM: 1409788800,
  ALGO: 0,
  USDT: 0,
  PAX: 0,
};

export const calculateStart = (symbol: string, time: string): number => {
  const coinStart = prop(symbol, start);
  const dayStart = dayjs().subtract(1, 'day').unix();
  const weekStart = dayjs().subtract(7, 'day').unix();
  const monthStart = dayjs().subtract(1, 'month').unix();
  const yearStart = dayjs().subtract(1, 'year').unix();

  switch (time) {
    case 'all':
      return coinStart;
    case 'year':
      return yearStart > coinStart ? yearStart : coinStart;
    case 'month':
      return monthStart > coinStart ? monthStart : coinStart;
    case 'week':
      return weekStart > coinStart ? weekStart : coinStart;
    case 'day':
      return dayStart > coinStart ? dayStart : coinStart;
    default:
      return coinStart;
  }
};

const INTERVALS = {
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
};

export const calculateInterval = (time: string) => {
  switch (time) {
    case 'year':
      return INTERVALS.DAY;
    case 'month':
      return INTERVALS.DAY;
    case 'week':
      return INTERVALS.HOUR;
    case 'day':
      return INTERVALS.HOUR;
    default:
      return INTERVALS.DAY;
  }
};
