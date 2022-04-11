import { useMemo, useState } from 'react';
import { generatePath, useParams } from 'react-router';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { useSwap } from 'app/contexts';
import SlippageTolerance from 'app/contexts/solana/swap/models/SlippageTolerance';
import { CompensationFee } from 'components/common/CompensationFee';
import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';
import { Button } from 'components/ui';

import type { SwapRouteParams } from '../types';
import { CustomButton } from './CustomButton';

const MAX_SLIPPAGE_TOLERANCE = 50;

const Wrapper = styled.div`
  display: grid;
  grid-row-gap: 16px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;

  border: 1px solid ${theme.colors.stroke.secondary};
  border-radius: 12px;
`;

const ListWrapper = styled.div`
  &.description {
    margin: -1px;

    background-color: ${theme.colors.bg.app};

    border: 1px solid ${theme.colors.stroke.primary};
    border-bottom-right-radius: 12px;
    border-bottom-left-radius: 12px;
  }
`;

const CompensationWrapper = styled.div`
  padding: 0 20px;
`;

const SlippageWrapper = styled.div`
  display: grid;
  grid-row-gap: 16px;
  margin: 16px 16px 20px 16px;
`;

const DescriptionWrapper = styled.div`
  margin: 16px 20px 16px 8px;
`;

const Title = styled.span`
  font-weight: 500;
  font-size: 14px;
  line-height: 120%;
`;

const ButtonsRow = styled.div`
  display: grid;
  grid-column-gap: 8px;
  grid-template-columns: repeat(5, 1fr);
`;

export const ButtonStyled = styled(Button)`
  box-sizing: border-box;

  height: 38px;

  font-weight: 500;
  font-size: 16px;
  line-height: 140%;

  border: 1px solid ${theme.colors.stroke.primary};
  border-radius: 8px;

  &.custom {
    width: 93px;
    padding: 0 5px;

    &.active {
      background-color: inherit;
    }
  }

  &.custom.active.editing {
    padding: 0 20px;
  }

  &.active {
    color: ${theme.colors.textIcon.active};

    font-weight: 700;

    background-color: ${theme.colors.bg.activePrimary};
    border-color: ${theme.colors.bg.buttonPrimary};
  }

  &:hover {
    background-color: ${theme.colors.bg.activePrimary};
  }
`;

const DescriptionList = styled.ul`
  padding-inline-start: 25px;
`;

const DescriptionItem = styled.li`
  font-weight: 400;
  font-size: 14px;
  line-height: 160%;

  &:not(:last-child) {
    margin-bottom: 25px;
  }
`;

const elDescriptionRender = () => (
  <ListWrapper className="description">
    <DescriptionWrapper>
      <DescriptionList>
        {[
          'A slippage is a difference between the expected price and the actual price at which a trade is executed',
          'Slippage can occur at any time, but it is most prevalent during periods of higher volatility',
          'Transactions that exceed 20% slippage tolerance may be frontrun',
          'Slippage tolerance cannot exceed 50%',
        ].map((item: string, idx: number) => (
          <DescriptionItem key={idx}>{item}</DescriptionItem>
        ))}
      </DescriptionList>
    </DescriptionWrapper>
  </ListWrapper>
);

const PREDEFINED_SLIPPAGE_VALUES = ['0.1', '0.5', '1', '5'];

export const SwapSlippageWidget = () => {
  const { symbol } = useParams<SwapRouteParams>();
  const backToPath = useMemo(() => generatePath('/swap/:symbol?', { symbol }), []);

  const { slippageTolerance, setSlippageTolerance, trade } = useSwap();

  const activeButtonIdx = useMemo(
    () => PREDEFINED_SLIPPAGE_VALUES.findIndex((value) => slippageTolerance.stringEq(value)),
    [slippageTolerance],
  );
  const isCustomSlippageValue = activeButtonIdx === -1;

  const [isCustomButtonActive, setIsCustomButtonActive] = useState(isCustomSlippageValue);

  const handleCustomButtonClick = () => setIsCustomButtonActive(true);

  const handleSlippageValueChange = (value: string) => {
    setIsCustomButtonActive(false);
    setSlippageTolerance(SlippageTolerance.fromString(value));
  };

  return (
    <WidgetPageWithBottom title={['Swap', 'Swap settings']} backTo={backToPath}>
      <Wrapper>
        <Content>
          <ListWrapper>
            <SlippageWrapper>
              <Title>Max price slippage</Title>
              <ButtonsRow>
                {PREDEFINED_SLIPPAGE_VALUES.map((value, idx) => (
                  <ButtonStyled
                    key={idx}
                    className={classNames({
                      active: !isCustomButtonActive && activeButtonIdx === idx,
                    })}
                    onClick={() => handleSlippageValueChange(value)}
                  >
                    {value}%
                  </ButtonStyled>
                ))}
                <CustomButton
                  isCustomSlippageValue={isCustomSlippageValue}
                  slippageValue={slippageTolerance.toString()}
                  maxSlippage={MAX_SLIPPAGE_TOLERANCE}
                  onClick={handleCustomButtonClick}
                  onValueChange={handleSlippageValueChange}
                />
              </ButtonsRow>
            </SlippageWrapper>
          </ListWrapper>
          {elDescriptionRender()}
        </Content>
        {trade.inputTokenName !== 'SOL' ? (
          <Content>
            <ListWrapper>
              <CompensationWrapper>
                <CompensationFee type="swap" isShow={true} />
              </CompensationWrapper>
            </ListWrapper>
          </Content>
        ) : undefined}
      </Wrapper>
    </WidgetPageWithBottom>
  );
};
