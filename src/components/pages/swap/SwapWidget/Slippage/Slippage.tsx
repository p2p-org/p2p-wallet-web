import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import { useSwapContext } from '@project-serum/swap-ui';
import classNames from 'classnames';

import { Accordion, Button, Icon, Input } from 'components/ui';

const Title = styled.div`
  display: flex;
  flex: 1;
  align-content: space-between;
`;

const Left = styled.div`
  flex: 1;
`;

const Right = styled.div`
  margin-right: 12px;
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

interface Props {}

export const Slippage: FC<Props> = (props) => {
  const { slippage, setSlippage } = useSwapContext();
  const [isCustomShow, setIsCustomShow] = useState(false);
  const [localSlippage, setLocalSlippage] = useState(String(slippage));

  const clearSlippage = (nextSlippage: string) => {
    let cleanSlippage = nextSlippage.replace(/,/g, '.'); // , to .

    // // ability to enter dot
    if (cleanSlippage === '.') {
      cleanSlippage = '0.';
    } else {
      cleanSlippage = cleanSlippage
        .replace(/(\D*)(\d*(\.\d{0,4})?)(.*)/, '$2')
        .replace(/^0(\d+)/, '$1');
    }

    return cleanSlippage;
  };

  const handleSlippageClick = (newSlippage: string) => () => {
    setSlippage(Number(clearSlippage(newSlippage)));
  };

  const handleSlippageChange = (newSlippage: string) => {
    const cleanSlippage = clearSlippage(newSlippage);
    // if slippage correct
    if (newSlippage && cleanSlippage === newSlippage) {
      setSlippage(Number(cleanSlippage));
    }

    setLocalSlippage(cleanSlippage);
  };

  const handleSlippageBlur = () => {
    setSlippage(Number(localSlippage));
  };

  const handleToggleCustomShow = () => {
    setIsCustomShow((state) => !state);
  };

  return (
    <Accordion
      title={
        <Title>
          <Left>Which cryptocurrencies can I use?</Left> <Right>{slippage} %</Right>
        </Title>
      }>
      <div>
        Slippage refers to the difference between the expected price of a trade and the price at
        which the trade is executed. Slippage can occur at any time but is most prevalent during
        periods of higher volatility when market orders are used.
      </div>
      <OptionsWrapper>
        {[0.1, 0.5, 1, 5].map((value) => (
          <OptionButton
            key={value}
            lightGray
            small
            className={classNames({ active: slippage === value })}
            onClick={handleSlippageClick(String(value))}>
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
            value={localSlippage}
            suffix="%"
            onChange={handleSlippageChange}
            onBlur={handleSlippageBlur}
            showClear
          />
        </CustomWrapper>
      ) : undefined}
    </Accordion>
  );
};
