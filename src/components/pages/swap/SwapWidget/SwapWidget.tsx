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

  // async function setupTokenAccounts() {
  //   setErrorMessage('');
  //
  //   if (!asyncStandardTokenAccounts.value) {
  //     throw new Error('UserTokenAccounts has not loaded yet');
  //   }
  //
  //   if (!wallet) {
  //     throw new Error('Wallet not set');
  //   }
  //
  //   const tokenNames = trade.getTokenNamesToSetup(asyncStandardTokenAccounts.value);
  //   setButtonState(ButtonState.TwoTransactionsConfirmStepOne);
  //
  //   let txSignature, executeSetup;
  //
  //   try {
  //     ({ txSignature, executeSetup } = await trade.confirmSetup(
  //       connection,
  //       tokenConfigs,
  //       programIds,
  //       wallet,
  //       tokenNames,
  //     ));
  //     // setSolanaExplorerLink(getExplorerUrl('tx', txSignature, cluster));
  //   } catch (e) {
  //     console.error(e);
  //     setErrorMessage(walletConfirmationFailure);
  //     setButtonState(ButtonState.TwoTransactionsStepOne);
  //     return;
  //   }
  //
  //   setButtonState(ButtonState.TwoTransactionsSendingStepOne);
  //
  //   try {
  //     await executeSetup();
  //   } catch (e) {
  //     console.error(e);
  //     setErrorMessage('Something went wrong during setup. Please try again.');
  //     setButtonState(ButtonState.TwoTransactionsRetryStepOne);
  //     return;
  //   }
  //
  //   // Hack: Pause for 10 seconds to increase the probability
  //   // that we fetch the new token account even if the RPC server
  //   // is unstable.
  //   await new Promise((resolve) => setTimeout(resolve, 10_000));
  //
  //   try {
  //     await refreshStandardTokenAccounts();
  //   } catch (e) {
  //     console.error(e);
  //   }
  //
  //   setButtonState(ButtonState.TwoTransactionsStepTwo);
  //   // setSolanaExplorerLink('');
  //
  //   // const snackbarKey = enqueueSnackbar(
  //   //   <SetupNotification
  //   //     closeSnackbar={() => closeSnackbar(snackbarKey)}
  //   //     txid={txSignature}
  //   //     tokenNames={tokenNames}
  //   //   />,
  //   // );
  // }
  //
  // async function onSubmit() {
  //   setErrorMessage('');
  //
  //   if (!asyncPools.value) {
  //     throw new Error('Pools have not loaded yet');
  //   }
  //
  //   if (!asyncStandardTokenAccounts.value || !inputUserTokenAccount) {
  //     throw new Error('UserTokenAccounts has not loaded yet');
  //   }
  //
  //   const inputAmount = trade.getInputAmount();
  //   const outputAmount = trade.getOutputAmount();
  //
  //   if (inputAmount.eq(ZERO) || outputAmount.eq(ZERO)) {
  //     throw new Error('Input amount has not been set');
  //   }
  //
  //   if (!trade.derivedFields) {
  //     throw new Error('Derived fields not set');
  //   }
  //
  //   if (!wallet) {
  //     throw new Error('Wallet not set');
  //   }
  //
  //   const inputUserTokenPublicKey = inputUserTokenAccount.account;
  //
  //   setButtonState((buttonState) => {
  //     if (buttonState === ButtonState.TwoTransactionsStepTwo) {
  //       return ButtonState.TwoTransactionsConfirmStepTwo;
  //     }
  //
  //     return ButtonState.ConfirmWallet;
  //   });
  //
  //   const intermediateTokenPublicKey = intermediateTokenName
  //     ? asyncStandardTokenAccounts.value[intermediateTokenName]
  //     : undefined;
  //
  //   let executeExchange, txSignature;
  //   try {
  //     ({ executeExchange, txSignature } = await trade.confirmExchange(
  //       connection,
  //       tokenConfigs,
  //       programIds,
  //       wallet,
  //       inputUserTokenPublicKey,
  //       intermediateTokenPublicKey?.account,
  //       outputUserTokenAccount?.account,
  //     ));
  //     // setSolanaExplorerLink(getExplorerUrl('tx', txSignature, cluster));
  //   } catch (e) {
  //     console.error(e);
  //     setErrorMessage(walletConfirmationFailure);
  //     setButtonState((buttonState) => {
  //       if (buttonState === ButtonState.TwoTransactionsConfirmStepTwo) {
  //         return ButtonState.TwoTransactionsStepTwo;
  //       }
  //
  //       return ButtonState.Exchange;
  //     });
  //     return;
  //   }
  //
  //   setButtonState((buttonState) => {
  //     if (buttonState === ButtonState.TwoTransactionsConfirmStepTwo) {
  //       return ButtonState.TwoTransactionsSendingStepTwo;
  //     }
  //
  //     return ButtonState.SendingTransaction;
  //   });
  //
  //   function getFailedTransactionErrorMessage(rawMessage: string) {
  //     if (rawMessage.includes('Transaction too large')) {
  //       return 'Transaction failed. Please try again.';
  //     } else if (rawMessage.includes('custom program error: 0x10')) {
  //       return 'The price moved more than your slippage tolerance setting. You can increase your tolerance or simply try again.';
  //     } else if (rawMessage.includes('Blockhash not found')) {
  //       return 'Transaction timed out. Please try again.';
  //     } else {
  //       return 'Oops, something went wrong. Please try again!';
  //     }
  //   }
  //
  //   try {
  //     await executeExchange();
  //   } catch (e) {
  //     console.error(e);
  //     const error = getFailedTransactionErrorMessage(e.message);
  //     setErrorMessage(error);
  //     setButtonState((buttonState) => {
  //       if (buttonState === ButtonState.TwoTransactionsSendingStepTwo) {
  //         return ButtonState.TwoTransactionsRetryStepTwo;
  //       }
  //
  //       return ButtonState.Retry;
  //     });
  //     return;
  //   }
  //
  //   try {
  //     const fetchingUserTokenAccounts = refreshStandardTokenAccounts();
  //     await Promise.all(trade.derivedFields.selectedRoute.map((poolId) => fetchPool(poolId)));
  //     await fetchingUserTokenAccounts;
  //   } catch (e) {
  //     console.error(e);
  //   }
  //
  //   setTrade(trade.clearAmounts());
  //   setButtonState(ButtonState.Exchange);
  //   // setSolanaExplorerLink('');
  //
  //   // const snackbarKey = enqueueSnackbar(
  //   //   <ExchangeNotification
  //   //     closeSnackbar={() => closeSnackbar(snackbarKey)}
  //   //     txid={txSignature}
  //   //     inputTokenAmount={inputAmount}
  //   //     inputTokenName={trade.inputTokenName}
  //   //     outputTokenAmount={outputAmount}
  //   //     outputTokenName={trade.outputTokenName}
  //   //     inputDecimals={tokenConfigs[trade.inputTokenName].decimals}
  //   //     outputDecimals={tokenConfigs[trade.outputTokenName].decimals}
  //   //   />,
  //   // );
  // }

  // const inputTokenAmount = inputUserTokenAccount?.accountInfo.amount;

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
          {/*<BottomWrapper>*/}
          {/*  <SwapButton />*/}
          {/*</BottomWrapper>*/}
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
