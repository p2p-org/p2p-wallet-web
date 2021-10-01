import React, { FC } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { Hint } from 'components/common/Hint';

import { WrapperWidgetPage } from '../../../common/SendSwapWidget/common/styled';
import { CurrentPrice } from './CurrentPrice';
import { Fees } from './Fees';
// import { PriceImpact } from './PriceImpact';
// import { Properties } from './Properties';
import { Reverse } from './Reverse';
import serumLogo from './serum_logo.svg';
import { SettingsAction } from './SettingsAction';
import { Slippage } from './Slippage';
import { SwapButton } from './SwapButton';
import { SwapFromForm } from './SwapFromForm';
import { SwapToForm } from './SwapToForm';

const ActionsWrapper = styled.div`
  display: flex;

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const Wrapper = styled.div`
  padding: 24px 20px;
`;

const FromSwapWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column; /* to don't collapse margins of children */

  margin-bottom: 8px;
  padding: 16px 20px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

const ToSwapWrapper = styled(FromSwapWrapper)``;

const Lines = styled.div`
  display: grid;
  grid-gap: 8px;
  margin-top: 32px;
`;

const BottomWrapper = styled.div`
  padding: 32px 0 0;
`;

const PoweredByBannerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;

  border-top: 1px solid ${rgba('#000', 0.05)};
`;

const PoweredBy = styled.div`
  margin-right: 10px;

  color: #a3a5ba;

  font-weight: 600;
  font-size: 14px;
`;

export const SwapWidget: FC = () => {
  return (
    <div>
      <WrapperWidgetPage
        title="Swap"
        icon="swap"
        action={
          <ActionsWrapper>
            <SettingsAction />
          </ActionsWrapper>
        }>
        <Wrapper>
          <FromSwapWrapper>
            <SwapFromForm />
          </FromSwapWrapper>
          <ToSwapWrapper>
            <Reverse />
            <SwapToForm />
          </ToSwapWrapper>
          <Lines>
            <CurrentPrice />
            {/*<PriceImpact />*/}
            <Slippage />
            <Fees />
          </Lines>
          <BottomWrapper>
            <SwapButton />
          </BottomWrapper>
        </Wrapper>
        <PoweredByBannerWrapper>
          <PoweredBy>Powered by </PoweredBy>
          <a href="https://dex.projectserum.com/" target="_blank" rel="noopener noreferrer noindex">
            <img src={serumLogo} alt="Serum" />
          </a>
        </PoweredByBannerWrapper>
      </WrapperWidgetPage>
      <Hint />
    </div>
  );
};
