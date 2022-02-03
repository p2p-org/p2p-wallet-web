import type { FC } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { WidgetPage } from 'components/common/WidgetPage';

import { CurrentPrice } from './CurrentPrice';
import { Fees } from './Fees';
import orcaLogo from './orca_logo.svg';
// import { PriceImpact } from './PriceImpact';
// import { Properties } from './Properties';
import { Reverse } from './Reverse';
import { Slippage } from './Slippage';
import { SwapButton } from './SwapButton';
import { SwapFromForm } from './SwapFromForm';
import { SwapToForm } from './SwapToForm';

// const ActionsWrapper = styled.div`
//   display: flex;
//
//   &:not(:last-child) {
//     margin-right: 10px;
//   }
// `;

const Wrapper = styled.div`
  padding: 24px 20px;
`;

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
  // useEffect(() => {
  //   if (trade.outputTooHigh) {
  //     setErrorMessage('The amount you entered is too high. Please try a smaller amount.');
  //   }
  // }, [trade]);

  return (
    <WidgetPage
      title="Swap"
      icon="swap"
      // action={
      //   <ActionsWrapper>
      //     <SettingsAction />
      //   </ActionsWrapper>
      // }
    >
      <Wrapper>
        <SwapFromForm />
        <Reverse />
        <SwapToForm />
        <Lines>
          <CurrentPrice />
          {/*/!*<PriceImpact />*!/*/}
          <Slippage />
          <Fees />
        </Lines>
        <BottomWrapper>
          <SwapButton />
        </BottomWrapper>
      </Wrapper>
      <PoweredByBannerWrapper>
        <PoweredBy>Powered by </PoweredBy>
        <a href="https://www.orca.so/" target="_blank" rel="noopener noreferrer noindex">
          <img src={orcaLogo} alt="Orca" />
        </a>
      </PoweredByBannerWrapper>
    </WidgetPage>
  );
};
