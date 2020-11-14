import { TOKENS_BY_ENTRYPOINT } from 'constants/tokens';
import { getRatesAction } from 'store/commands';
import { AppThunk } from 'store/types';

export const getRates = (): AppThunk => async (dispatch, getState) => {
  const { entrypoint } = getState().data.blockchain;

  const rates = [];

  const tokens = TOKENS_BY_ENTRYPOINT[entrypoint] || [];
  tokens.push({ tokenSymbol: 'SOL' });

  await Promise.all(
    tokens.map(async (token) => {
      try {
        const res = await fetch(
          `https://serum-api.bonfida.com/orderbooks/${token.tokenSymbol}USDT`,
        );
        if (!res.ok) {
          throw new Error();
        }

        const result = await res.json();
        rates.push(result);
      } catch {
        console.error(`Can't get rates for ${token.tokenSymbol}`);
      }
    }),
  );

  return dispatch(getRatesAction(rates));
};
