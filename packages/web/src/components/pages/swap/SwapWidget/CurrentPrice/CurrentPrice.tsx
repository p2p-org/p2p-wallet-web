import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import Decimal from 'decimal.js';

import { useSwap } from 'app/contexts/solana/swap';
import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  padding: 26px 20px;

  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

export const Left = styled.div`
  display: flex;
  flex-grow: 1;
`;

export const Right = styled.div`
  display: flex;
  align-items: center;
`;

const Rate = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: -8px;

  color: #000;
`;

const ChangeRateWrapper = styled.div`
  margin-left: 12px;

  cursor: pointer;
`;

const ChangeRateIcon = styled(Icon)`
  display: flex;
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

export const CurrentPrice: FC = () => {
  const { trade } = useSwap();
  const [isReverse, setIsReverse] = useState(false);

  const handleChangeRateClick = () => {
    setIsReverse((state) => !state);
  };

  function formatExchangeRate(): string {
    const one = new Decimal(1);
    return (isReverse ? one.div(trade.getExchangeRate()) : trade.getExchangeRate())
      .toSignificantDigits(6)
      .toString();
  }

  if (trade.getExchangeRate().eq(0)) {
    return null;
  }

  return (
    <Wrapper>
      <Left>Current price</Left>
      <Right>
        <Rate>
          1 {isReverse ? trade.outputTokenName : trade.inputTokenName} = {formatExchangeRate()}{' '}
          {isReverse ? trade.inputTokenName : trade.outputTokenName}
          <ChangeRateWrapper onClick={handleChangeRateClick}>
            <ChangeRateIcon name="swap" />
          </ChangeRateWrapper>
        </Rate>
      </Right>
    </Wrapper>
  );
};
