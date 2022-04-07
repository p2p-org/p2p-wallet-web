import type { FunctionComponent } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { useSwap } from 'app/contexts';
import { Button as ButtonUI, Icon } from 'components/ui';
import { trackEvent } from 'utils/analytics';

import { useShowSettings } from '../../hooks/useShowSettings';

const Wrapper = styled.div`
  position: relative;
`;

const ActionIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-right: 8px;

  color: ${theme.colors.textIcon.active};
`;

const Button = styled(ButtonUI)`
  border: 1px solid ${theme.colors.stroke.primary};
`;

/* const ActionWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px 0 2px;

  font-weight: 600;
  font-size: 14px;
  line-height: 140%;

  background: #f6f6f8;
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    color: #5887ff;

    background: #eff3ff;

    ${ActionIcon} {
      color: #5887ff;
    }
  }
`;

const SettingsWrapper = styled.div`
  position: absolute;
  right: 0;
  z-index: 1;

  min-width: 340px;
  margin-top: 8px;
  padding: 20px 16px;

  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.1);
`;

const Description = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 120%;
`;

const OptionsWrapper = styled.div`
  display: flex;
  margin-top: 20px;

  & > :not(:last-child) {
    margin-right: 10px;
  }
`;

const CustomButton = styled(Button)`
  width: 36px;
  padding: 0;
`;

const PenIcon = styled(Icon)`
  width: 24px;
  height: 24px;
`;

const OptionButton = styled(Button)`
  min-width: 52px;
  padding: 8px;

  font-weight: 600;
  font-size: 14px;
  line-height: 140%;

  border: 1px solid transparent;

  &:hover {
    color: #5887ff;

    background: #eff3ff;
    border-color: transparent;
  }

  &.active {
    color: #5887ff;

    background: #fff;
    border-color: #5887ff;
  }
`;

const CustomWrapper = styled.div`
  margin-top: 20px;
`;

const CustomLabel = styled.label`
  display: flex;
  margin-bottom: 8px;

  color: #000;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  margin-top: 20px;

  & > :not(:last-child) {
    margin-right: 10px;
  }
`;

const BottomButton = styled(Button)`
  min-width: 104px;
`; */

export const SettingsAction: FunctionComponent = () => {
  const { slippageTolerance, setSlippageTolerance } = useSwap();
  const [nextSlippageTolerance, setNextSlippageTolerance] = useState(String(slippageTolerance));
  const { handleShowSettings } = useShowSettings();

  const handleToggleCustomShow = () => {
    setIsCustomShow((state) => !state);
  };

  const handleDoneClick = () => {
    trackEvent('swap_slippage_done_click', {
      slippage: Number(nextSlippageTolerance),
    });

    setSlippage(Number(nextSlippageTolerance));
  };

  const handleCloseClick = () => {};

  const handleSlippageChange = (newSlippage: string) => {
    let cleanSlippage = newSlippage.replace(/,/g, '.'); // , to .

    // // ability to enter dot
    if (cleanSlippage === '.') {
      cleanSlippage = '0.';
    } else {
      cleanSlippage = cleanSlippage
        .replace(/(\D*)(\d*(\.\d{0,4})?)(.*)/, '$2')
        .replace(/^0(\d+)/, '$1');
    }

    setNextSlippageTolerance(cleanSlippage);
  };

  const isDisabled = Number.parseFloat(String(nextSlippageTolerance)) > 100;

  return (
    <Wrapper>
      {/* <ActionWrapper  > */}
      <Button small onClick={handleShowSettings}>
        <ActionIcon name="gear" />
        Swap settings
      </Button>
      {/* </ActionWrapper> */}
    </Wrapper>
  );
  /* {isShow ? (
        <SettingsWrapper>
          <Description>
            Slippage refers to the difference between the expected price of a trade and the price at
            which the trade is executed. Slippage can occur at any time but is most prevalent during
            periods of higher volatility when market orders are used.
          </Description>
          <OptionsWrapper>
            {['0.1', '0.5', '1', '5'].map((value) => (
              <OptionButton
                key={value}
                lightGray
                small
                className={classNames({ active: nextSlippage === value })}
                onClick={() => handleSlippageChange(value)}
              >
                {value}%
              </OptionButton>
            ))}
            <CustomButton hollow small onClick={handleToggleCustomShow}>
              <PenIcon name="pen" />
            </CustomButton>
          </OptionsWrapper>
          {isCustomShow ? (
            <CustomWrapper>
              <CustomLabel htmlFor="slippage">Custom</CustomLabel>
              <Input
                id="slippage"
                value={nextSlippage}
                suffix="%"
                onChange={handleSlippageChange}
                showClear
              />
            </CustomWrapper>
          ) : undefined}
          <ButtonsWrapper>
            <BottomButton primary medium disabled={isDisabled} onClick={handleDoneClick}>
              Done
            </BottomButton>
            <BottomButton lightGray medium onClick={handleCloseClick}>
              Cancel
            </BottomButton>
          </ButtonsWrapper>
        </SettingsWrapper>
          ) : undefined} 
    </Wrapper>
  );*/
};
