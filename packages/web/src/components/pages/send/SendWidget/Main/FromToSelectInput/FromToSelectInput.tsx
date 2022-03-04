import type { FC } from 'react';
import { useMemo } from 'react';

import { styled } from '@linaria/react';
import { ZERO } from '@orca-so/sdk';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';
import type { Token } from '@saberhq/token-utils';
import { TokenAmount } from '@saberhq/token-utils';
import classNames from 'classnames';

import { AccountCreationFeeTooltip } from 'components/common/AccountCreationFeeTooltip';
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

const InputWrapper = styled.div`
  display: flex;
`;

type Props = {
  direction?: 'from' | 'to';
  tokenAccounts: readonly TokenAccount[];
  tokenAccount?: TokenAccount | null;
  amount?: string;
  feeAmount?: TokenAmount | null;
  onTokenAccountChange: (token: Token, tokenAccount: TokenAccount | null) => void;
  onAmountChange: (minorAmount: string, type?: 'available') => void;
  disabled?: boolean;
  disabledInput?: boolean;
  className?: string;
};

export const FromToSelectInput: FC<Props> = ({
  direction = 'from',
  tokenAccounts,
  tokenAccount,
  amount,
  feeAmount,
  onTokenAccountChange,
  onAmountChange,
  disabled,
  disabledInput,
  className,
}) => {
  const tokenAccountBalance = useMemo(() => {
    if (!tokenAccount?.balance) {
      return null;
    }

    let tokenAccountBalance = tokenAccount.balance;

    if (feeAmount) {
      const balanceSubstractFee = tokenAccount.balance.toU64().sub(feeAmount.toU64());

      tokenAccountBalance = balanceSubstractFee.gt(ZERO)
        ? new TokenAmount(tokenAccount.balance.token, balanceSubstractFee)
        : new TokenAmount(tokenAccount.balance.token, 0);
      return tokenAccountBalance;
    }

    return tokenAccountBalance;
  }, [feeAmount, tokenAccount]);

  const handleAllBalanceClick = () => {
    if (!tokenAccountBalance) {
      return;
    }

    onAmountChange(tokenAccountBalance.toExact(), 'available');
  };

  const handleAmountChange = (nextAmount: string) => {
    onAmountChange(nextAmount);
  };

  const renderBalance = () => {
    if (!tokenAccountBalance) {
      return;
    }

    return tokenAccountBalance.toExact();
  };

  const hasBalance = tokenAccountBalance ? tokenAccountBalance.asNumber >= Number(amount) : false;
  const isAmountEqualMaxBalance = tokenAccountBalance?.toExact() === amount;

  return (
    <Wrapper className={className}>
      <TopWrapper>
        <FromToTitle>{direction === 'from' ? 'From' : 'To'}</FromToTitle>
        <BalanceText>
          {tokenAccount ? (
            direction === 'from' ? (
              <AllBalance
                className={classNames({
                  disabled,
                  error: !hasBalance,
                  success: Number(amount) && hasBalance,
                })}
              >
                <WalletBalanceIcon name="wallet" />
                {renderBalance()}
                {!isAmountEqualMaxBalance ? (
                  <Max onClick={handleAllBalanceClick}>MAX</Max>
                ) : undefined}
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
        <InputWrapper>
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
          {feeAmount ? <AccountCreationFeeTooltip /> : undefined}
        </InputWrapper>
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
