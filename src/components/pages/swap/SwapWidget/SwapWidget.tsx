import React, { FunctionComponent, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { rgba } from 'polished';

import { adjustForSlippage } from 'api/pool/Pool';
import { usePoolFromLocation } from 'api/pool/utils/state';
import { TokenAccount } from 'api/token/TokenAccount';
import { SendSwapWidget } from 'components/common/SendSwapWidget';
import { ToastManager } from 'components/common/ToastManager';
import { Icon } from 'components/ui';
import { SYSTEM_PROGRAM_ID, WRAPPED_SOL_MINT } from 'constants/solana/bufferLayouts';
import { executeSwap } from 'store/slices/swap/SwapSlice';
import { updateTokenPairState } from 'store/slices/tokenPair/TokenPairSlice';
import { tokenPairSelector } from 'store/slices/tokenPair/utils/tokenPair';
import { majorAmountToMinor, minorAmountToMajor } from 'utils/amount';

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

const SlippageOption = styled.button`
  height: 35px;
  padding: 0 18px;

  color: ${rgba('#000', 0.5)};

  background: #f7f7f7;
  border: 1px solid transparent;
  border-radius: 8px;

  outline: none;
  cursor: pointer;

  appearance: none;

  &.active {
    color: #000;

    border-color: rgba(0, 0, 0, 0.5);
  }

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

export const SwapWidget: FunctionComponent = () => {
  const dispatch = useDispatch();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isReverseRate, setIsReverseRate] = useState(false);

  const {
    firstAmount,
    secondAmount,
    firstTokenAccount,
    secondTokenAccount,
    firstToken,
    secondToken,
    selectedPool,
    tokenAccounts,
    slippage,
  } = useSelector(tokenPairSelector);

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

  const handleSlippageChange = (newSlippage: number) => {
    dispatch(
      updateTokenPairState({
        slippage: newSlippage,
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

  return (
    <SendSwapWidget
      type="swap"
      title="Swap"
      disabled={isExecuting || !selectedPool}
      actionText={
        // eslint-disable-next-line unicorn/no-nested-ternary
        isExecuting ? 'Processing...' : selectedPool ? 'Swap' : 'This pair is unavailable'
      }
      rate={
        rate ? (
          <Rate>
            {rate} {(isReverseRate ? secondToken : firstToken)?.symbol} per{' '}
            {(isReverseRate ? firstToken : secondToken)?.symbol}
            <ChangeRateWrapper onClick={handleChangeRateClick}>
              <ChangeRateIcon name="swap" />
            </ChangeRateWrapper>
          </Rate>
        ) : undefined
      }
      properties={
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
          <PropertyLine>
            Slippage:
            <PropertyValue>
              {[0.001, 0.005, 0.01, 0.25].map((value) => (
                <SlippageOption
                  key={value}
                  onClick={() => handleSlippageChange(value)}
                  className={classNames({ active: slippage === value })}>
                  {value * 100}%
                </SlippageOption>
              ))}
            </PropertyValue>
          </PropertyLine>
        </PropertiesWrapper>
      }
      fromTokenAccount={firstTokenAccount}
      fromAmount={firstToken ? minorAmountToMajor(firstAmount, firstToken).toString() : ''}
      toTokenAccount={secondTokenAccount}
      toAmount={secondToken ? minorAmountToMajor(secondAmount, secondToken).toString() : ''}
      onFromTokenAccountChange={selectFirstTokenHandleChange}
      onFromAmountChange={updateFirstAmount}
      onToTokenAccountChange={selectSecondTokenHandleChange}
      // onToAmountChange={handleToAmountChange}
      onSubmit={handleSubmit}
      onReverseClick={handleReverseClick}
    />
  );
};
