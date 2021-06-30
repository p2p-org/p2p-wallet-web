import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import { AccountLayout } from '@solana/spl-token';
import { Decimal } from 'decimal.js';
import { rgba } from 'polished';
import { any, complement, isNil, or, pathEq } from 'ramda';

import { adjustForSlippage, Pool } from 'api/pool/Pool';
import { usePoolFromLocation } from 'api/pool/utils/state';
import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { SettingsAction } from 'components/common/SendSwapWidget/SwapWidget/SettingsAction';
import { ToastManager } from 'components/common/ToastManager';
import { Button, Icon, Tooltip } from 'components/ui';
import { openModal } from 'store/actions/modals';
import {
  SHOW_MODAL_TRANSACTION_CONFIRM,
  SHOW_MODAL_TRANSACTION_STATUS,
} from 'store/constants/modalTypes';
import { updatePools } from 'store/slices/pool/PoolSlice';
import { executeSwap } from 'store/slices/swap/SwapSlice';
import { clearTokenPairState, updateTokenPairState } from 'store/slices/tokenPair/TokenPairSlice';
import { matchesPool, tokenPairSelector } from 'store/slices/tokenPair/utils/tokenPair';
import {
  getMinimumBalanceForRentExemption,
  getRecentBlockhash,
} from 'store/slices/wallet/WalletSlice';
import { majorAmountToMinor, minorAmountToMajor } from 'utils/amount';
import { trackEvent } from 'utils/analytics';
import { useIntervalHook } from 'utils/hooks/useIntervalHook';

import { Hint } from '../../Hint';
import {
  BottomWrapper,
  ButtonWrapper,
  FeeLeft,
  FeeLine,
  FeeRight,
  FromToSelectInputStyled,
  FromWrapper,
  TooltipRow,
  TxName,
  TxValue,
  WrapperWidgetPage,
} from '../common/styled';
import orcaLogo from './orca_logo.svg';

const ActionsWrapper = styled.div`
  display: flex;

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const ReverseWrapper = styled.div`
  position: absolute;
  top: -24px;
  right: 32px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #5887ff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
`;

const ReverseIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #fff;
`;

const ToSwapWrapper = styled(FromWrapper)`
  padding-top: 34px;
`;

const Rate = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: -8px;

  color: #000;
`;

const ChangeRateWrapper = styled.div`
  margin-left: 20px;

  cursor: pointer;
`;

const ChangeRateIcon = styled(Icon)`
  display: flex;
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const PropertiesWrapper = styled.div`
  &:not(:empty) {
    padding-bottom: 20px;
  }

  > :not(:last-child) {
    margin-bottom: 8px;
  }
`;

const PropertyLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const PropertyValue = styled.div`
  color: #000;
`;

const TooltipStyled = styled(Tooltip)`
  border-bottom: 1px dashed #a3a5ba;
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

const UPDATE_POOLS_INTERVAL = 5000;

const formatFee = (amount: number): number =>
  new Decimal(amount)
    .div(10 ** 9)
    .toDecimalPlaces(9)
    .toNumber();

const isInPoolsTokenAccounts = (pools: Pool[], selectedTokenAccount?: TokenAccount) => (
  tokenAccount: TokenAccount,
) => {
  if (selectedTokenAccount) {
    return any(matchesPool(selectedTokenAccount.mint, tokenAccount.mint), pools);
  }

  return any(
    or(
      pathEq(['tokenA', 'mint', 'address'], tokenAccount.mint.address),
      pathEq(['tokenB', 'mint', 'address'], tokenAccount.mint.address),
    ),
    pools,
  );
};

const isInPoolsToken = (pools: Pool[], selectedToken?: Token) => (token: Token) => {
  if (selectedToken) {
    return any(matchesPool(selectedToken, token), pools);
  }

  return any(
    or(
      pathEq(['tokenA', 'mint', 'address'], token.address),
      pathEq(['tokenB', 'mint', 'address'], token.address),
    ),
    pools,
  );
};

export const SwapWidget: FunctionComponent = () => {
  const dispatch = useDispatch();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isReverseRate, setIsReverseRate] = useState(false);
  const [rentFee, setRentFee] = useState(0);
  const [lamportsPerSignature, setLamportsPerSignature] = useState(0);
  const [txFee, setTxFee] = useState(0);
  const availableTokens = useSelector((state) =>
    state.global.availableTokens.map((token) => Token.from(token)),
  );

  const {
    firstAmount,
    secondAmount,
    firstTokenAccount,
    secondTokenAccount,
    firstToken,
    secondToken,
    selectedPool,
    tokenAccounts,
    availablePools,
    slippage,
  } = useSelector(tokenPairSelector);

  usePoolFromLocation({
    tokenAccounts,
    updateAction: updateTokenPairState,
  });

  useIntervalHook(() => {
    void dispatch(updatePools());
  }, UPDATE_POOLS_INTERVAL);

  useEffect(() => {
    return () => {
      dispatch(clearTokenPairState());
    };
  }, []);

  useEffect(() => {
    const mount = async () => {
      try {
        const resultRentFee = unwrapResult(
          await dispatch(getMinimumBalanceForRentExemption(AccountLayout.span)),
        );

        const resultRecentBlockhash = unwrapResult(await dispatch(getRecentBlockhash()));

        setRentFee(formatFee(resultRentFee));
        setLamportsPerSignature(
          formatFee(resultRecentBlockhash.feeCalculator.lamportsPerSignature),
        );
      } catch (error) {
        console.log(error);
      }
    };

    void mount();
  }, []);

  useEffect(() => {
    let signatures = 2; // fee payer, authority

    if ([firstTokenAccount?.mint.symbol, secondTokenAccount?.mint.symbol].includes('SOL')) {
      signatures += 1; // wSol account
    }

    if (isNil(secondTokenAccount)) {
      signatures += 1; // new account
    }

    setTxFee(new Decimal(lamportsPerSignature).mul(signatures).toDecimalPlaces(6).toNumber());
  }, [lamportsPerSignature, firstTokenAccount, secondTokenAccount]);

  const firstTokenAccounts = useMemo(() => {
    return tokenAccounts.filter(isInPoolsTokenAccounts(availablePools));
  }, [secondTokenAccount, tokenAccounts, availablePools]);

  const secondTokenAccounts = useMemo(() => {
    return tokenAccounts
      .filter(isInPoolsTokenAccounts(availablePools, firstTokenAccount))
      .filter(
        (tokenAccount) =>
          !(firstTokenAccount && tokenAccount.address.equals(firstTokenAccount.address)),
      );
  }, [firstTokenAccount, tokenAccounts, availablePools]);

  const secondTokens = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const isAvailableTokenAccounts = (tokenAccounts: TokenAccount[]) => (token: Token) =>
      any(pathEq(['mint', 'address'], token.address), tokenAccounts);

    return availableTokens
      .filter(isInPoolsToken(availablePools, firstToken))
      .filter(complement(isAvailableTokenAccounts(tokenAccounts)));
  }, [firstTokenAccount, tokenAccounts, availableTokens, availablePools]);

  const feeProperties = useMemo(() => {
    if (selectedPool && firstToken && firstAmount) {
      return {
        amount: selectedPool.impliedFee(firstToken, firstAmount),
        token: secondToken,
      };
    }
  }, [selectedPool, firstToken, firstAmount]);

  const minimumToAmountWithSlippage = useMemo(() => {
    if (secondToken && secondAmount && !isNil(slippage)) {
      return adjustForSlippage(minorAmountToMajor(secondAmount, secondToken), 'down', slippage);
    }
  }, [secondToken, secondAmount, slippage]);

  const isNeedCreateWallet = isNil(secondTokenAccount);

  const handleSubmit = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = unwrapResult(
      await dispatch(
        openModal({
          modalType: SHOW_MODAL_TRANSACTION_CONFIRM,
          props: {
            type: 'swap',
            params: {
              firstToken,
              firstTokenAccount,
              secondToken,
              secondTokenAccount,
              firstAmount,
              secondAmount,
            },
          },
        }),
      ),
    );

    if (!result) {
      return false;
    }

    try {
      setIsExecuting(true);
      const action = executeSwap();

      trackEvent('swap_swap_click', {
        tokenA: firstToken?.symbol || '',
        tokenB: secondToken?.symbol || '',
        sumA: firstAmount,
        sumB: secondAmount,
      });

      unwrapResult(
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await dispatch(
          openModal({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            modalType: SHOW_MODAL_TRANSACTION_STATUS,
            props: {
              type: 'swap',
              action,
              fromToken: firstToken,
              fromAmount: new Decimal(firstAmount),
              toToken: secondToken,
              toAmount: new Decimal(secondAmount),
            },
          }),
        ),
      );
    } catch (error) {
      ToastManager.error((error as Error).message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTokenSelectionChange = (key: 'firstToken' | 'secondToken') => (
    selectedToken: Token,
    selectedAccountToken: TokenAccount | null,
  ) => {
    // Change SOL to WSOL in token pair
    // if (selectedToken.address.equals(SYSTEM_PROGRAM_ID)) {
    //   let newSelectedAccountToken: TokenAccount = selectedAccountToken as TokenAccount;
    //   const serialized = newSelectedAccountToken.serialize();
    //
    //   newSelectedAccountToken = TokenAccount.from({
    //     ...serialized,
    //     mint: {
    //       ...serialized.mint,
    //       symbol: 'SOL',
    //       address: WRAPPED_SOL_MINT.toBase58(),
    //       isSimulated: true,
    //     },
    //   });
    // }

    if (key === 'firstToken') {
      trackEvent('swap_token_a_select_click', { tokenTicker: selectedToken.symbol || '' });
    } else if (key === 'secondToken') {
      trackEvent('swap_token_b_select_click', { tokenTicker: selectedToken.symbol || '' });
    }

    dispatch(
      updateTokenPairState({
        [key]: selectedToken.serialize(),
        [`${key}Account`]: selectedAccountToken ? selectedAccountToken.serialize() : null,
      }),
    );
  };

  const selectFirstTokenHandleChange = handleTokenSelectionChange('firstToken');
  const selectSecondTokenHandleChange = handleTokenSelectionChange('secondToken');

  const handleAmountChange = (key: 'firstAmount' | 'secondAmount') => (
    minorAmount: string,
    type?: 'available',
  ) => {
    const token = key === 'firstAmount' ? firstToken : secondToken;

    if (!token) {
      return;
    }

    if (type === 'available') {
      trackEvent('swap_available_click', { sum: Number(minorAmount) });
    } else if (key === 'firstAmount') {
      trackEvent('swap_token_a_amount_keydown', { sum: Number(minorAmount) });
    } else if (key === 'secondAmount') {
      trackEvent('swap_token_b_amount_keydown', { sum: Number(minorAmount) });
    }

    dispatch(
      updateTokenPairState({
        [key]: majorAmountToMinor(Number(minorAmount), token).toNumber(),
      }),
    );
  };

  const updateFirstAmount = handleAmountChange('firstAmount');
  const updateSecondAmount = handleAmountChange('secondAmount');

  const handleReverseClick = () => {
    trackEvent('swap_reverse_click');

    dispatch(
      updateTokenPairState({
        firstAmount: secondAmount,
        firstToken: secondToken?.serialize(),
        firstTokenAccount: secondTokenAccount?.serialize(),
        secondAmount: firstAmount,
        secondToken: firstToken?.serialize(),
        secondTokenAccount: firstTokenAccount?.serialize(),
      }),
    );
  };

  const handleChangeRateClick = () => {
    setIsReverseRate((state) => !state);
  };

  const renderActionText = () => {
    if (isExecuting) {
      return 'Processing...';
    }

    if (selectedPool) {
      return 'Swap now';
    }

    if (!firstToken || !secondToken) {
      return 'Choose tokens for swap';
    }

    return 'This pair is unavailable';
  };

  const fee = feeProperties
    ? minorAmountToMajor(feeProperties.amount, feeProperties.token).toNumber()
    : undefined;

  const rate =
    selectedPool && firstToken && secondToken
      ? selectedPool
          .impliedRate(
            isReverseRate ? firstToken : secondToken,
            isReverseRate ? firstAmount : secondAmount,
          )
          .toNumber()
      : undefined;

  const hasBalance = firstTokenAccount
    ? firstTokenAccount.balance.toNumber() >= Number(firstAmount)
    : false;

  const isDisabled = isExecuting || !selectedPool || !hasBalance;
  const isShowFee = firstToken && fee && feeProperties;
  const minimumFee = txFee + rentFee; // trx fee + wSol rent

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
          <FromToSelectInputStyled
            tokenAccounts={firstTokenAccounts}
            token={firstToken}
            tokenAccount={firstTokenAccount}
            amount={firstToken ? minorAmountToMajor(firstAmount, firstToken).toString() : ''}
            feeAmount={isNeedCreateWallet ? minimumFee + rentFee : minimumFee}
            onTokenAccountChange={selectFirstTokenHandleChange}
            onAmountChange={updateFirstAmount}
            disabled={isExecuting}
            disabledInput={!firstToken}
          />
        </FromWrapper>
        <ToSwapWrapper>
          <ReverseWrapper onClick={handleReverseClick}>
            <ReverseIcon name="swap" />
          </ReverseWrapper>
          <FromToSelectInputStyled
            direction="to"
            tokens={secondTokens}
            tokenAccounts={secondTokenAccounts}
            token={secondToken}
            tokenAccount={secondTokenAccount}
            amount={secondToken ? minorAmountToMajor(secondAmount, secondToken).toString() : ''}
            feeAmount={minimumFee}
            onTokenAccountChange={selectSecondTokenHandleChange}
            onAmountChange={updateSecondAmount}
            disabled={isExecuting}
            disabledInput={!secondToken}
          />
          {rate ? (
            <FeeLine>
              <FeeLeft>Price:</FeeLeft>
              <FeeRight>
                <Rate>
                  {rate.toFixed(6)} {(isReverseRate ? secondToken : firstToken)?.symbol} per{' '}
                  {(isReverseRate ? firstToken : secondToken)?.symbol}
                  <ChangeRateWrapper onClick={handleChangeRateClick}>
                    <ChangeRateIcon name="swap" />
                  </ChangeRateWrapper>
                </Rate>
              </FeeRight>
            </FeeLine>
          ) : undefined}
        </ToSwapWrapper>
        <BottomWrapper>
          <PropertiesWrapper>
            {minimumToAmountWithSlippage ? (
              <PropertyLine>
                Minimum Received:
                <PropertyValue>
                  {minimumToAmountWithSlippage.toNumber().toFixed(secondToken?.decimals)}{' '}
                  {secondToken?.symbol}
                </PropertyValue>
              </PropertyLine>
            ) : undefined}
            {isShowFee ? (
              <>
                <PropertyLine>
                  Liquidity Provider Fee:
                  <PropertyValue>
                    {fee} {feeProperties?.token.symbol}
                  </PropertyValue>
                </PropertyLine>
                <PropertyLine>
                  Fee:
                  <PropertyValue>
                    <TooltipStyled title={`${isNeedCreateWallet ? txFee + rentFee : txFee} SOL`}>
                      <TooltipRow>
                        <TxName>Transaction:</TxName>
                        <TxValue>{`${txFee} SOL`}</TxValue>
                      </TooltipRow>
                      {isNeedCreateWallet ? (
                        <TooltipRow>
                          <TxName>Wallet creation:</TxName>
                          <TxValue>{`${rentFee} SOL`}</TxValue>
                        </TooltipRow>
                      ) : undefined}
                    </TooltipStyled>
                  </PropertyValue>
                </PropertyLine>
              </>
            ) : undefined}
            {selectedPool && firstToken && secondToken && !isNil(slippage) ? (
              <PropertyLine>
                Slippage:
                <PropertyValue>{slippage} %</PropertyValue>
              </PropertyLine>
            ) : undefined}
          </PropertiesWrapper>
          <ButtonWrapper>
            <Button primary={!isDisabled} disabled={isDisabled} big full onClick={handleSubmit}>
              {renderActionText()}
            </Button>
          </ButtonWrapper>
        </BottomWrapper>
        <PoweredByBannerWrapper>
          <PoweredBy>Powered by </PoweredBy>
          <a href="https://www.orca.so/pools" target="_blank" rel="noopener noreferrer noindex">
            <img src={orcaLogo} alt="Orca" />
          </a>
        </PoweredByBannerWrapper>
      </WrapperWidgetPage>
      <Hint />
    </div>
  );
};
