import type { FC } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { Defaults } from 'new/services/Defaults';
import { numberToString } from 'new/utils/NumberExtensions';

import type { WalletDetailViewModel } from '../WalletDetail.ViewModel';

const Wrapped = styled.div`
  padding: 16px 20px;

  &.isSticky {
    padding: 0 16px;
  }
`;

const ValueCurrency = styled.div`
  color: #000;
  font-weight: bold;
  font-size: 22px;
  line-height: 120%;

  &.isSticky {
    font-weight: bold;
    font-size: 16px;
    line-height: 120%;
  }
`;

const BottomWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  &:not(:first-child) {
    margin-top: 4px;
  }

  &.isSticky {
    margin-top: 0;

    font-weight: 600;
    font-size: 14px;
    line-height: 120%;
  }
`;

const ValueOriginal = styled.div``;

interface Props {
  viewModel: Readonly<WalletDetailViewModel>;
  isSticky?: boolean;
}

export const BalanceView: FC<Props> = observer(({ viewModel, isSticky }) => {
  if (!viewModel.wallet) {
    return null;
  }

  const tokenBalance = expr(() => {
    const wallet = viewModel.wallet;
    if (!wallet) {
      return '';
    }
    return `${numberToString(wallet.amount, { maximumFractionDigits: 9 })} ${wallet.token.symbol}`;
  });

  const fiatBalance = expr(() => {
    const wallet = viewModel.wallet;
    return `${Defaults.fiat.symbol} ${
      wallet
        ? numberToString(wallet.amountInCurrentFiat, {
            maximumFractionDigits: 2,
          })
        : '0'
    }`;
  });

  return (
    <Wrapped className={classNames({ isSticky })}>
      {viewModel.wallet ? (
        <ValueCurrency className={classNames({ isSticky })}>{fiatBalance}</ValueCurrency>
      ) : null}
      <BottomWrapper className={classNames({ isSticky })}>
        <ValueOriginal>{tokenBalance}</ValueOriginal>
      </BottomWrapper>
    </Wrapped>
  );
});
