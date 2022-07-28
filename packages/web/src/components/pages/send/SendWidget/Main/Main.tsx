import type { FC } from 'react';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import { ZERO } from '@orca-so/sdk';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { TokenAmount } from '@p2p-wallet-web/token-utils';
import { theme } from '@p2p-wallet-web/ui';
import type { Token } from '@saberhq/token-utils';
import { u64 } from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Feature } from 'flagged';

import { useFeeCalculation, useSendState } from 'app/contexts';
import { FeePaySelector } from 'components/common/FeePaySelector';
import { FEATURE_PAY_BY } from 'config/featureFlags';
import { trackEvent } from 'utils/analytics';

import { FromToTitle, TopWrapper } from './common/styled';
import { FromToSelectInput } from './FromToSelectInput';
import { NetworkSelect } from './NetworkSelect';
import { ToAddressInput } from './ToAddressInput';
import { TransactionDetails } from './TransactionDetails';

const FromWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column; /* to don't collapse margins of children */

  padding: 16px 20px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

const ToWrapper = styled.div`
  min-width: 0;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

const TopWrapperStyled = styled(TopWrapper)`
  padding: 16px 20px 0;
`;

const ConfirmWrapper = styled.div`
  padding: 16px 20px;

  color: ${theme.colors.textIcon.primary};
  font-size: 14px;
  line-height: 160%;
  letter-spacing: 0.01em;

  background: ${theme.colors.system.warningBg};
  border: 0.5px solid ${theme.colors.system.warningMain};
  border-radius: 0 0 12px 12px;
`;

export const Main: FC = () => {
  const history = useHistory();

  const {
    fromTokenAccount,
    setFromTokenAccount,
    fromAmount,
    setFromAmount,
    isExecuting,
    isRenBTC,
    isRawSOL,
    isShowConfirmAddressSwitch,
  } = useSendState();

  const fees = useFeeCalculation();

  const tokenAccounts = useUserTokenAccounts();

  const handleFromTokenAccountChange = (
    _nextToken: Token,
    nextTokenAccount: TokenAccount | null,
  ) => {
    if (!nextTokenAccount?.key) {
      return;
    }

    trackEvent('send_select_token_click', {
      tokenTicker: nextTokenAccount.balance?.token.symbol || '',
    });

    setFromTokenAccount(nextTokenAccount);
    history.replace(`/send/${nextTokenAccount.key.toBase58()}`);
  };

  const handleFromAmountChange = (minorAmount: string, type?: string) => {
    let newAmountStr = minorAmount;

    if (type === 'available') {
      if (isRawSOL) {
        const newAmount = new u64(Number(newAmountStr) * LAMPORTS_PER_SOL);
        const newAmountMinusFee = newAmount.sub(fees.totalFee);

        newAmountStr = newAmountMinusFee.lt(ZERO)
          ? '0'
          : new TokenAmount(fromTokenAccount.balance.token, newAmountMinusFee).toExact();
      }
      trackEvent('send_available_click', { sum: Number(newAmountStr) });
    } else {
      trackEvent('send_amount_keydown', { sum: Number(newAmountStr) });
    }

    setFromAmount(newAmountStr);
  };

  const handleFeeTokenAccountChange = (
    _nextToken: Token,
    nextTokenAccount: TokenAccount | null,
  ) => {
    if (!nextTokenAccount?.key) {
      return;
    }
  };

  const isDisabled = isExecuting;
  const tokenSymbol = fromTokenAccount?.balance?.token?.symbol;

  return (
    <>
      <FromWrapper>
        <FromToSelectInput
          tokenAccounts={tokenAccounts}
          tokenAccount={fromTokenAccount}
          onTokenAccountChange={handleFromTokenAccountChange}
          amount={fromAmount}
          onAmountChange={handleFromAmountChange}
          disabled={isDisabled}
        />
      </FromWrapper>

      <ToWrapper>
        <TopWrapperStyled>
          <FromToTitle>To</FromToTitle>
        </TopWrapperStyled>
        <ToAddressInput />
        {isShowConfirmAddressSwitch ? (
          <ConfirmWrapper>
            This address does not appear to have a {tokenSymbol} account. You have to pay a one-time
            fee to create a {tokenSymbol} account for this address.
          </ConfirmWrapper>
        ) : undefined}
      </ToWrapper>

      {isRenBTC ? <NetworkSelect /> : undefined}

      <Feature name={FEATURE_PAY_BY}>
        <FeePaySelector
          tokenAccounts={tokenAccounts}
          onTokenAccountChange={handleFeeTokenAccountChange}
        />
      </Feature>

      <TransactionDetails />
    </>
  );
};
