import type { FC } from 'react';
import { useCallback } from 'react';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { TokenAvatar } from 'components/common/TokenAvatar';
import { Select, SelectItem } from 'components/ui';
import type { BuyViewModelProps } from 'new/scenes/Main/Buy/Subviews/Moonpay/types';
import { trackEvent1 } from 'new/services/analytics';
import type { CryptoCurrency } from 'new/services/BuyService/structures';

const InfoWrapper = styled.div`
  margin-left: 12px;
`;

const Line = styled.div`
  line-height: 17px;
`;

const Text = styled.div`
  display: inline-block;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.01em;

  &.bottom {
    color: ${theme.colors.textIcon.primary};
    font-size: 16px;
  }

  &::first-letter {
    text-transform: uppercase;
  }
`;

const Item = styled.div`
  margin-left: 12px;

  &::first-letter {
    text-transform: uppercase;
  }
`;

const Normal = styled.span`
  font-weight: normal;
`;

export const CurrencySelect: FC<BuyViewModelProps> = observer(({ viewModel }) => {
  const history = useHistory();

  const handleItemClick = useCallback(
    (nextCurrency: CryptoCurrency) => () => {
      trackEvent1({
        name: 'Buy_Coin_Changed',
        params: { From_Coin: viewModel.crypto.symbol, To_Coin: nextCurrency.symbol },
      });

      history.push(`/buy/${nextCurrency.symbol}`);
    },
    [],
  );

  return (
    <Select
      value={
        <>
          <TokenAvatar symbol={viewModel.crypto.symbol} size={44} />
          <InfoWrapper>
            <Line>
              <Text>I want to buy</Text>
            </Line>
            <Line>
              <Text className="bottom">
                {viewModel.crypto.fullName} ({viewModel.crypto.symbol})
              </Text>
            </Line>
          </InfoWrapper>
        </>
      }
    >
      {Object.values(viewModel.cryptoCurrenciesForSelect).map((itemCurrency) => (
        <SelectItem
          key={itemCurrency.symbol}
          isSelected={viewModel.crypto.symbol === itemCurrency.symbol}
          onItemClick={handleItemClick(itemCurrency)}
        >
          <TokenAvatar symbol={itemCurrency.symbol} size={44} />
          <Item>
            {itemCurrency.fullName} <Normal>({itemCurrency.symbol})</Normal>
          </Item>
        </SelectItem>
      ))}
    </Select>
  );
});
