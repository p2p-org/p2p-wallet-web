import type { FC } from 'react';

import { styled } from '@linaria/react';

import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';

import { Fees } from './Fees';
// import { PriceImpact } from './PriceImpact';
// import { Properties } from './Properties';
import { Reverse } from './Reverse';
import { SettingsAction } from './SettingsAction';
import { SwapButton } from './SwapButton';
import { SwapFromForm } from './SwapFromForm';
import { SwapToForm } from './SwapToForm';

const ActionsWrapper = styled.div`
  display: flex;

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const Wrapper = styled.div``;

/* const BottomWrapper = styled.div`
  padding: 32px 0 0;
`; */

/* const PoweredByBannerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;

  border-top: 1px solid ${rgba('#000', 0.05)};
`; */

/* const PoweredBy = styled.div`
  margin-right: 10px;

  color: #a3a5ba;

  font-weight: 600;
  font-size: 14px;
`; */

export const SwapWidget: FC = () => {
  // useEffect(() => {
  //   if (trade.outputTooHigh) {
  //     setErrorMessage('The amount you entered is too high. Please try a smaller amount.');
  //   }
  // }, [trade]);

  return (
    <WidgetPageWithBottom
      title="Swap"
      icon="swap"
      bottom={<SwapButton />}
      action={
        <ActionsWrapper>
          <SettingsAction />
        </ActionsWrapper>
      }
    >
      <Wrapper>
        <SwapFromForm />
        <Reverse />
        <SwapToForm />
      </Wrapper>
      {/* <Lines> */}
      {/* <CurrentPrice /> */}
      {/*/!*<PriceImpact />*!/*/}
      {/* <Slippage /> */}
      <Fees />
      {/* </Lines> */}
      {/* </Wrapper> */}
      {/* <PoweredByBannerWrapper>
        <PoweredBy>Powered by </PoweredBy>
        <a href="https://www.orca.so/" target="_blank" rel="noopener noreferrer noindex">
          <img src={orcaLogo} alt="Orca" />
        </a>
      </PoweredByBannerWrapper> */}
    </WidgetPageWithBottom>
  );
};
