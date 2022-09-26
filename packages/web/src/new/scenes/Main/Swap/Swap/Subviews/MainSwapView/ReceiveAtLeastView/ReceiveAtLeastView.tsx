import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { Defaults } from 'new/services/Defaults';
import { numberToString } from 'new/utils/NumberExtensions';

import type { SwapViewModel } from '../../../Swap.ViewModel';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 20px 16px;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;

  &.isHidden {
    visibility: hidden;
  }

  & > :first-child {
    white-space: nowrap;
  }

  & > :last-child {
    text-align: right;
  }
`;

const Black = styled.span`
  color: ${theme.colors.textIcon.primary};
`;

interface Props {
  viewModel: Readonly<SwapViewModel>;
}

export const ReceiveAtLeastView: FC<Props> = observer(({ viewModel }) => {
  const text = expr(() => {
    const minReceiveAmount = viewModel.minimumReceiveAmount;
    const wallet = viewModel.destinationWallet;

    if (!minReceiveAmount) {
      return null;
    }

    const formattedReceiveAmount = numberToString(minReceiveAmount, {
      maximumFractionDigits: 9,
    });

    const fiatPrice = wallet?.priceInCurrentFiat;
    if (!fiatPrice) {
      return formattedReceiveAmount;
    }

    const receiveFiatPrice = numberToString(minReceiveAmount * fiatPrice, {
      maximumFractionDigits: 2,
    });
    const formattedReceiveFiatAmount = `(~${Defaults.fiat.symbol}${receiveFiatPrice})`;

    return (
      <>
        <Black>{formattedReceiveAmount}</Black> {formattedReceiveFiatAmount}
      </>
    );
  });

  return (
    <Wrapper className={classNames({ isHidden: !text })}>
      <div>Receive at least:</div>
      <div>{text}</div>
    </Wrapper>
  );
});
