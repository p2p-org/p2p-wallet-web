import React, { FC } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { Hint } from 'components/common/Hint';
import { PriceLine } from 'components/pages/swap/SwapWidget/PriceLine';
import { Properties } from 'components/pages/swap/SwapWidget/Properties';
import { Reverse } from 'components/pages/swap/SwapWidget/Reverse';
import { SettingsAction } from 'components/pages/swap/SwapWidget/SettingsAction';
import { SwapFromForm } from 'components/pages/swap/SwapWidget/SwapFromForm';
import { SwapToForm } from 'components/pages/swap/SwapWidget/SwapToForm';

import { WrapperWidgetPage } from '../../../common/SendSwapWidget/common/styled';
import serumLogo from './serum_logo.svg';
import { SwapButton } from './SwapButton';

const ActionsWrapper = styled.div`
  display: flex;

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const FromWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column; /* to don't collapse margins of children */

  padding: 24px 20px 20px;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
`;

const SwapFromFormStyled = styled(SwapFromForm)`
  margin-bottom: 26px;
`;

const ToSwapWrapper = styled(FromWrapper)`
  padding-top: 34px;
`;

const SwapToFormStyled = styled(SwapToForm)`
  margin-bottom: 26px;
`;

const BottomWrapper = styled.div`
  padding: 24px 20px;

  &:not(:has(div:only-child)) {
    padding: 20px;
  }
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
        <FromWrapper>
          <SwapFromFormStyled />
        </FromWrapper>
        <ToSwapWrapper>
          <Reverse />
          <SwapToFormStyled />
          <PriceLine />
        </ToSwapWrapper>
        <BottomWrapper>
          <Properties />
          <SwapButton />
        </BottomWrapper>
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
