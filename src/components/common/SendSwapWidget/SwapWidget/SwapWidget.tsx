import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import { Decimal } from 'decimal.js';
import { any, complement, isNil, or, pathEq } from 'ramda';

import { adjustForSlippage, Pool } from 'api/pool/Pool';
import { usePoolFromLocation } from 'api/pool/utils/state';
import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { SettingsAction } from 'components/common/SendSwapWidget/SwapWidget/SettingsAction';
import { ToastManager } from 'components/common/ToastManager';
import { Button, Icon } from 'components/ui';
import { openModal } from 'store/actions/modals';
import { SHOW_MODAL_TRANSACTION_STATUS } from 'store/constants/modalTypes';
import { executeSwap } from 'store/slices/swap/SwapSlice';
import { clearTokenPairState, updateTokenPairState } from 'store/slices/tokenPair/TokenPairSlice';
import { matchesPool, tokenPairSelector } from 'store/slices/tokenPair/utils/tokenPair';
import { majorAmountToMinor, minorAmountToMajor } from 'utils/amount';

import {
  BottomWrapper,
  ButtonWrapper,
  FeeLeft,
  FeeLine,
  FeeRight,
  FromToSelectInputStyled,
  FromWrapper,
  Hint,
  WrapperWidgetPage,
} from '../common/styled';

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
  padding-bottom: 20px;

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

  useEffect(() => {
    return () => {
      dispatch(clearTokenPairState());
    };
  }, []);

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
    // eslint-disable-next-line no-shadow
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
        token: selectedPool.otherToken(firstToken),
      };
    }
  }, [selectedPool, firstToken, firstAmount]);

  const minimumToAmountWithSlippage = useMemo(() => {
    if (secondToken && secondAmount && !isNil(slippage)) {
      return adjustForSlippage(minorAmountToMajor(secondAmount, secondToken), 'down', slippage);
    }
  }, [secondToken, secondAmount, slippage]);

  const handleSubmit = async () => {
    try {
      setIsExecuting(true);
      const action = executeSwap();

      unwrapResult(
        await dispatch(
          openModal({
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

    dispatch(
      updateTokenPairState({
        [key]: selectedToken.serialize(),
        [`${key}Account`]: selectedAccountToken ? selectedAccountToken.serialize() : null,
      }),
    );
  };

  const selectFirstTokenHandleChange = handleTokenSelectionChange('firstToken');
  const selectSecondTokenHandleChange = handleTokenSelectionChange('secondToken');

  const handleAmountChange = (key: 'firstAmount' | 'secondAmount') => (minorAmount: string) => {
    const token = key === 'firstAmount' ? firstToken : secondToken;

    if (!token) {
      return;
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
      ? selectedPool.impliedRate(isReverseRate ? firstToken : secondToken, firstAmount).toNumber()
      : undefined;

  const isDisabled = isExecuting || !selectedPool;

  return (
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
                {rate} {(isReverseRate ? secondToken : firstToken)?.symbol} per{' '}
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
                {minimumToAmountWithSlippage.toNumber()} {secondToken?.symbol}
              </PropertyValue>
            </PropertyLine>
          ) : undefined}
          {firstToken && fee && feeProperties ? (
            <PropertyLine>
              Liquidity Provider Fee:{' '}
              <PropertyValue>
                {fee} {feeProperties.token.symbol}
              </PropertyValue>
            </PropertyLine>
          ) : undefined}
          {!isNil(slippage) ? (
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
          <Hint>All deposits are stored 100% non-custodiallity with keys held on this device</Hint>
        </ButtonWrapper>
      </BottomWrapper>
    </WrapperWidgetPage>
  );
};
