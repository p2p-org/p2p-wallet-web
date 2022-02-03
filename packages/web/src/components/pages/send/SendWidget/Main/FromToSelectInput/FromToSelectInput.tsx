import type { FunctionComponent } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';
import type { Token } from '@saberhq/token-utils';
import { TokenAmount } from '@saberhq/token-utils';
import classNames from 'classnames';
import JSBI from 'jsbi';

import { AmountUSD } from 'components/common/AmountUSD';
import { Icon } from 'components/ui';
import { InputAmount } from 'components/ui/InputAmount';

import { FromToTitle, TopWrapper } from '../common/styled';
import { TokenSelector } from './TokenSelector';

const Wrapper = styled.div``;

const BalanceText = styled.div`
  display: flex;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const AllBalance = styled.div`
  display: flex;
  align-items: center;

  cursor: pointer;

  &.disabled {
    cursor: auto;

    pointer-events: none;
  }

  &.error {
    color: ${theme.colors.system.errorMain};
  }

  &.success {
    color: ${theme.colors.system.successMain};
  }
`;

const WalletBalanceIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  margin-right: 4px;
`;

const Max = styled.div`
  margin-left: 8px;

  color: ${theme.colors.textIcon.active};
  text-transform: uppercase;
`;

const MainWrapper = styled.div`
  position: relative;

  display: grid;
  grid-template-columns: min-content 1fr;
`;

const BalanceWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 3px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const AmountUSDStyled = styled(AmountUSD)`
  margin-left: 3px;
`;

type Props = {
  direction?: 'from' | 'to';
  tokenAccounts: readonly TokenAccount[];
  tokenAccount?: TokenAccount | null;
  amount?: string;
  feeAmount?: string;
  onTokenAccountChange: (token: Token, tokenAccount: TokenAccount | null) => void;
  onAmountChange: (minorAmount: string, type?: 'available') => void;
  disabled?: boolean;
  disabledInput?: boolean;
  className?: string;
};

export const FromToSelectInput: FunctionComponent<Props> = ({
  direction = 'from',
  tokenAccounts,
  tokenAccount,
  amount,
  feeAmount: feeAmountString,
  onTokenAccountChange,
  onAmountChange,
  disabled,
  disabledInput,
  className,
}) => {
  const handleAllBalanceClick = () => {
    if (!tokenAccount?.balance) {
      return;
    }

    let tokenAccountBalance = tokenAccount.balance;

    if (feeAmountString) {
      const [feeAmount, symbol] = feeAmountString.split(' ');

      if (feeAmount && tokenAccount?.balance?.token.symbol === symbol) {
        const fee = new TokenAmount(tokenAccount.balance.token, JSBI.BigInt(feeAmount));
        const balanceSubstractFee = tokenAccount.balance.subtract(fee);

        tokenAccountBalance = balanceSubstractFee.greaterThan(0)
          ? balanceSubstractFee
          : new TokenAmount(tokenAccount.balance.token, 0);
      }
    }

    onAmountChange(tokenAccountBalance.toExact(), 'available');
  };

  const handleAmountChange = (nextAmount: string) => {
    onAmountChange(nextAmount);
  };

  const renderBalance = () => {
    if (!tokenAccount?.balance) {
      return null;
    }

    if (feeAmountString) {
      const [feeAmount, symbol] = feeAmountString.split(' ');

      if (feeAmount && tokenAccount?.balance?.token.symbol === symbol) {
        const fee = new TokenAmount(tokenAccount.balance.token, JSBI.BigInt(feeAmount));
        const balanceSubstractFee = tokenAccount.balance.subtract(fee);

        const tokenAccountBalance = balanceSubstractFee.greaterThan(0)
          ? balanceSubstractFee
          : new TokenAmount(tokenAccount.balance.token, 0);

        return tokenAccountBalance.toExact();
      }
    }

    return tokenAccount.balance.toExact();
  };

  const hasBalance = tokenAccount?.balance
    ? tokenAccount.balance.asNumber >= Number(amount)
    : false;

  return (
    <Wrapper className={className}>
      <TopWrapper>
        <FromToTitle>{direction === 'from' ? 'From' : 'To'}</FromToTitle>
        <BalanceText>
          {tokenAccount ? (
            direction === 'from' && !disabled ? (
              <AllBalance
                className={classNames({
                  disabled,
                  error: !hasBalance,
                  success: Number(amount) && hasBalance,
                })}
              >
                <WalletBalanceIcon name="wallet" />
                {renderBalance()}
                <Max onClick={handleAllBalanceClick}>MAX</Max>
              </AllBalance>
            ) : undefined
          ) : undefined}
        </BalanceText>
      </TopWrapper>
      <MainWrapper>
        <TokenSelector
          tokenAccounts={tokenAccounts}
          tokenAccount={tokenAccount}
          direction={direction}
          onTokenAccountChange={onTokenAccountChange}
        />
        <InputAmount
          placeholder={
            (tokenAccount?.balance?.token &&
              TokenAmount.parse(tokenAccount.balance.token, '0').toExact()) ||
            '0'
          }
          value={amount}
          onChange={handleAmountChange}
          disabled={disabled || disabledInput}
        />
        {/*<BalanceWrapper>*/}
        {/*  {tokenAccount?.balance?.token ? (*/}
        {/*    <BalanceText>*/}
        {/*      ≈{' '}*/}
        {/*      <AmountUSDStyled*/}
        {/*        value={TokenAmount.parse(tokenAccount.balance.token, localAmount || '0')}*/}
        {/*      />*/}
        {/*    </BalanceText>*/}
        {/*  ) : undefined}*/}
        {/*</BalanceWrapper>*/}
      </MainWrapper>
    </Wrapper>
  );
};
