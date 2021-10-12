import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import { rgba } from 'polished';

import { useSolana } from 'app/contexts/solana';
import { useConfig, usePools, usePrice, useSwap } from 'app/contexts/swap';
import SlippageTolerance from 'app/contexts/swap/models/SlippageTolerance';
import Trade from 'app/contexts/swap/models/Trade';
import { UserTokenAccountMap, useUser } from 'app/contexts/swap/user';
import { getMaxAge } from 'app/contexts/swap/utils/AsyncCache';
import {
  getOraclePrice,
  getRateDifferenceFromOracle,
  isFairPrice,
} from 'app/contexts/swap/utils/fairness';
import { getTradeId } from 'app/contexts/swap/utils/pools';
import { displayPriceImpact } from 'app/contexts/swap/utils/priceImpact';
import {
  getInputToken,
  getOutputToken,
  updateInputToken,
  updateOutputToken,
  useSelectedTokens,
} from 'app/contexts/swap/utils/selectedTokens';
import { minSolBalanceForSwap } from 'app/contexts/swap/utils/tokenAccounts';
import { Hint } from 'components/common/Hint';
import { getExplorerUrl } from 'utils/connection';
import { useLocalStorage } from 'utils/hooks/useLocalStorage';

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
  // const { wallet, connection } = useSolana();
  // const { programIds, tokenConfigs } = useConfig();
  const { trade } = useSwap();

  // const intermediateTokenName = trade.getIntermediateTokenName();

  // const [errorMessage, setErrorMessage] = useState<React.ReactNode>('');
  // const [solanaExplorerLink, setSolanaExplorerLink] = useState('');

  // useEffect(() => {
  //   if (trade.outputTooHigh) {
  //     setErrorMessage('The amount you entered is too high. Please try a smaller amount.');
  //   }
  // }, [trade]);

  // const highPriceDescription =
  //   "Your trade is large compared to the size of the pool. If you're unsure what to do, read more about price impact <ExternalLinkWrapper href='https://docs.orca.so/#what-is-price-impact'>here</ExternalLinkWrapper>.";
  // const walletConfirmationFailure = 'Click approve in your wallet to continue.';
  // const ExternalLinkWrapper = reactComponentWrapper(ExternalLink);

  return (
    <div>
      <WrapperWidgetPage
        title="Swap"
        icon="swap"
        // action={
        //   <ActionsWrapper>
        //     <SettingsAction />
        //   </ActionsWrapper>
        // }
      >
        <Wrapper>
          <FromSwapWrapper>
            <SwapFromForm />
          </FromSwapWrapper>
          <ToSwapWrapper>
            <Reverse />
            <SwapToForm />
          </ToSwapWrapper>
          <Lines>
            {/*<CurrentPrice />*/}
            {/*/!*<PriceImpact />*!/*/}
            {/*<Slippage />*/}
            {/*<Fees />*/}
          </Lines>
          <BottomWrapper>
            <SwapButton />
          </BottomWrapper>
        </Wrapper>
        <PoweredByBannerWrapper>
          <PoweredBy>Powered by </PoweredBy>
          <a href="https://www.orca.so/" target="_blank" rel="noopener noreferrer noindex">
            <img src={serumLogo} alt="Orca" />
          </a>
        </PoweredByBannerWrapper>
      </WrapperWidgetPage>
      <Hint />
    </div>
  );
};
