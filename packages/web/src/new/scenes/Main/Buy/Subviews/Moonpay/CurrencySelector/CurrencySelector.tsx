import type { FC } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { TokenAvatar } from 'components/common/TokenAvatar';
import type { BuyViewModelProps } from 'new/scenes/Main/Buy/Subviews/Moonpay/types';
import { trackEvent } from 'new/sdk/Analytics';
import type { CryptoCurrency } from 'new/services/BuyService/structures';
import { Select, SelectItem } from 'new/ui/components/common/Select';

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
  const navigate = useNavigate();

  const handleItemClick = useCallback(
    (nextCurrency: CryptoCurrency) => () => {
      const fromCoin = viewModel.crypto.symbol;
      const toCoin = nextCurrency.symbol;

      if (fromCoin === toCoin) {
        return;
      }

      //track event before coin changes
      trackEvent({
        name: 'Buy_Coin_Changed',
        params: {
          From_Coin: fromCoin,
          To_Coin: toCoin,
        },
      });

      // change coin
      navigate(`/buy/${nextCurrency.symbol}`);
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
