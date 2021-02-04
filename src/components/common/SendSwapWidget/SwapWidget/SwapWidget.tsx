import React, { FunctionComponent, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { any, or, pipe, prop, propEq } from 'ramda';

import { adjustForSlippage, Pool } from 'api/pool/Pool';
import { usePoolFromLocation } from 'api/pool/utils/state';
import { TokenAccount } from 'api/token/TokenAccount';
import { SettingsAction } from 'components/common/SendSwapWidget/SwapWidget/SettingsAction';
import { ToastManager } from 'components/common/ToastManager';
import { Button, Icon } from 'components/ui';
import { SYSTEM_PROGRAM_ID, WRAPPED_SOL_MINT } from 'constants/solana/bufferLayouts';
import { executeSwap } from 'store/slices/swap/SwapSlice';
import { updateTokenPairState } from 'store/slices/tokenPair/TokenPairSlice';
import { tokenPairSelector } from 'store/slices/tokenPair/utils/tokenPair';
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
  IconStyled,
  IconWrapper,
  Title,
  TitleWrapper,
  WrapperWidget,
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

const isAvailableTokenAccounts = (pools: Pool[]) => (tokenAccount: TokenAccount) =>
  any(
    or(
      pipe(prop('tokenA'), prop('mint'), propEq('address', tokenAccount.mint.address)),
      pipe(prop('tokenB'), prop('mint'), propEq('address', tokenAccount.mint.address)),
    ),
    pools,
  );

export const SwapWidget: FunctionComponent = () => {
  const dispatch = useDispatch();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isReverseRate, setIsReverseRate] = useState(false);
  // const availableTokens = useSelector((state) =>
  //   state.global.availableTokens.map((token) => Token.from(token)),
  // );

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

  // const availableTokenAccounts = useMemo(() => {
  //   const isAvailableTokenAccounts = (availableTokens: Token[]) => (tokenAccount: TokenAccount) =>
  //     any(propEq('address', tokenAccount.mint.address), availableTokens);
  //
  //   return tokenAccounts.filter(isAvailableTokenAccounts(availableTokens));
  // }, [availableTokens, tokenAccounts]);

  const availableTokenAccounts = useMemo(() => {
    return tokenAccounts.filter(isAvailableTokenAccounts(availablePools));
  }, [tokenAccounts, availablePools]);

  const selectableTokenAccounts = useMemo(() => {
    if (!firstTokenAccount) {
      return [];
    }

    return tokenAccounts
      .filter(isAvailableTokenAccounts(availablePools))
      .filter((tokenAccount) => !tokenAccount.address.equals(firstTokenAccount.address));
  }, [firstTokenAccount, tokenAccounts, availablePools]);

  const feeProperties = useMemo(() => {
    if (selectedPool && firstToken && firstAmount) {
      return {
        amount: selectedPool.impliedFee(firstToken, firstAmount),
        token: selectedPool.otherToken(firstToken),
      };
    }
  }, [selectedPool, firstToken, firstAmount]);

  const minimumToAmountWithSlippage = useMemo(() => {
    if (secondToken && secondAmount && slippage) {
      return adjustForSlippage(minorAmountToMajor(secondAmount, secondToken), 'down', slippage);
    }
  }, [secondToken, secondAmount, slippage]);

  usePoolFromLocation({
    tokenAccounts,
    updateAction: updateTokenPairState,
  });

  const handleSubmit = async () => {
    try {
      setIsExecuting(true);
      await dispatch(executeSwap());
    } catch (error) {
      ToastManager.error(error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTokenSelectionChange = (key: 'firstToken' | 'secondToken') => (
    selectedAccountToken: TokenAccount | string,
  ) => {
    let newSelectedAccountToken: TokenAccount = selectedAccountToken as TokenAccount;

    // Change SOL to WSOL in token pair
    if (newSelectedAccountToken?.mint.address.equals(SYSTEM_PROGRAM_ID)) {
      const serialized = newSelectedAccountToken.serialize();

      newSelectedAccountToken = TokenAccount.from({
        ...serialized,
        mint: {
          ...serialized.mint,
          symbol: 'WSOL',
          address: WRAPPED_SOL_MINT.toBase58(),
          isSimulated: true,
        },
      });
    }

    dispatch(
      updateTokenPairState({
        [key]: newSelectedAccountToken.mint.serialize(),
        [`${key}Account`]: newSelectedAccountToken.serialize(),
      }),
    );
  };

  const selectFirstTokenHandleChange = handleTokenSelectionChange('firstToken');
  const selectSecondTokenHandleChange = handleTokenSelectionChange('secondToken');

  const updateFirstAmount = (minorAmount: string) => {
    if (!firstToken) {
      return;
    }

    dispatch(
      updateTokenPairState({
        firstAmount: majorAmountToMinor(Number(minorAmount), firstToken).toNumber(),
      }),
    );
  };

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

  const fee = feeProperties
    ? minorAmountToMajor(feeProperties.amount, feeProperties.token).toNumber()
    : undefined;

  const rate =
    selectedPool && firstToken && secondToken
      ? selectedPool.impliedRate(isReverseRate ? firstToken : secondToken, firstAmount).toNumber()
      : undefined;

  const isDisabled = isExecuting || !selectedPool;

  return (
    <WrapperWidget
      title={
        <TitleWrapper>
          <IconWrapper>
            <IconStyled name="top" />
          </IconWrapper>
          <Title>Swap</Title>
        </TitleWrapper>
      }
      action={
        <ActionsWrapper>
          <SettingsAction />
        </ActionsWrapper>
      }>
      <FromWrapper>
        <FromToSelectInputStyled
          tokenAccounts={availableTokenAccounts}
          tokenAccount={firstTokenAccount}
          amount={firstToken ? minorAmountToMajor(firstAmount, firstToken).toString() : ''}
          onTokenAccountChange={selectFirstTokenHandleChange}
          onAmountChange={updateFirstAmount}
          disabled={isDisabled}
        />
      </FromWrapper>
      <ToSwapWrapper>
        <ReverseWrapper onClick={handleReverseClick}>
          <ReverseIcon name="swap" />
        </ReverseWrapper>
        <FromToSelectInputStyled
          direction="to"
          tokenAccounts={selectableTokenAccounts}
          tokenAccount={secondTokenAccount}
          amount={secondToken ? minorAmountToMajor(secondAmount, secondToken).toString() : ''}
          onTokenAccountChange={selectSecondTokenHandleChange}
          onAmountChange={() => {}}
          disabled={isDisabled}
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
          {fee ? (
            <PropertyLine>
              Liquidity Provider Fee: <PropertyValue>{fee} SOL</PropertyValue>
            </PropertyLine>
          ) : undefined}
          {slippage ? (
            <PropertyLine>
              Slippage:
              <PropertyValue>{slippage} %</PropertyValue>
            </PropertyLine>
          ) : undefined}
        </PropertiesWrapper>
        <ButtonWrapper>
          <Button primary={!isDisabled} disabled={isDisabled} big full onClick={handleSubmit}>
            {/* eslint-disable-next-line unicorn/no-nested-ternary */}
            {isExecuting ? 'Processing...' : selectedPool ? 'Swap now' : 'This pair is unavailable'}
          </Button>
          <Hint>All deposits are stored 100% non-custodiallity with keys held on this device</Hint>
        </ButtonWrapper>
      </BottomWrapper>
    </WrapperWidget>
  );
};
