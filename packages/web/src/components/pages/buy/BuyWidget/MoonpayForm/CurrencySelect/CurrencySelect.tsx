import type { FC } from 'react';
import { useCallback } from 'react';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import type { BuyCurrencySelectType } from 'app/contexts';
import { BUY_CURRENCIES_SELECT, useBuyState } from 'app/contexts';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Select, SelectItem } from 'components/ui';

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

export const CurrencySelect: FC = () => {
  const history = useHistory();
  const { currency } = useBuyState();

  const handleItemClick = useCallback(
    (nextCurrency: BuyCurrencySelectType) => async () => {
      history.push(`/buy/${nextCurrency.symbol}`);
    },
    [],
  );

  return (
    <Select
      value={
        <>
          <TokenAvatar symbol={currency.symbol} size={44} />
          <InfoWrapper>
            <Line>
              <Text>I want to buy</Text>
            </Line>
            <Line>
              <Text className="bottom">
                {currency.name} ({currency.symbol})
              </Text>
            </Line>
          </InfoWrapper>
        </>
      }
    >
      {Object.values(BUY_CURRENCIES_SELECT).map((itemCurrency) => (
        <SelectItem
          key={itemCurrency.symbol}
          isSelected={currency.symbol === itemCurrency.symbol}
          onItemClick={handleItemClick(itemCurrency)}
        >
          <TokenAvatar symbol={itemCurrency.symbol} size={44} />
          <Item>
            {itemCurrency.name} <Normal>({itemCurrency.symbol})</Normal>
          </Item>
        </SelectItem>
      ))}
    </Select>
  );
};
