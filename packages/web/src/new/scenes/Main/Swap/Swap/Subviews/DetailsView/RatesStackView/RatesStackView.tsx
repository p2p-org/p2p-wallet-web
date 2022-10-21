import type { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { ListWrapper } from 'components/ui/AccordionDetails/common';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { numberToString } from 'new/utils/NumberExtensions';

import { DetailRatesView } from './DetailRatesView';

interface Props {
  exchangeRate: number | null;
  sourceWallet: Wallet | null;
  destinationWallet: Wallet | null;
}

export const RatesStackView: FC<Props> = observer(
  ({ exchangeRate, sourceWallet, destinationWallet }) => {
    const fromRate = expr(() => {
      const rate = exchangeRate;
      const source = sourceWallet;
      const destination = destinationWallet;
      if (!rate || !source || !destination) {
        return null;
      }

      const sourceSymbol = source.token.symbol;
      const destinationSymbol = destination.token.symbol;

      const fiatPrice = numberToString(source.priceInCurrentFiat, { maximumFractionDigits: 2 });
      const formattedFiatPrice = `(~${Defaults.fiat.symbol}${fiatPrice})`;

      return {
        token: sourceSymbol,
        price: `${numberToString(rate, { maximumFractionDigits: 9 })} ${destinationSymbol}`,
        fiatPrice: formattedFiatPrice,
      };
    });

    const toRate = expr(() => {
      const rate = !exchangeRate ? null : 1 / exchangeRate;
      const source = sourceWallet;
      const destination = destinationWallet;
      if (!rate || !source || !destination) {
        return null;
      }

      const sourceSymbol = source.token.symbol;
      const destinationSymbol = destination.token.symbol;

      const fiatPrice = numberToString(destination.priceInCurrentFiat, {
        maximumFractionDigits: 2,
      });
      const formattedFiatPrice = `(~${Defaults.fiat.symbol}${fiatPrice})`;

      return {
        token: destinationSymbol,
        price: `${numberToString(rate, { maximumFractionDigits: 9 })} ${sourceSymbol}`,
        fiatPrice: formattedFiatPrice,
      };
    });

    if (!fromRate && !toRate) {
      return null;
    }

    return (
      <ListWrapper>
        {fromRate ? <DetailRatesView {...fromRate} /> : null}
        {toRate ? <DetailRatesView {...toRate} /> : null}
      </ListWrapper>
    );
  },
);
