import type { FC } from 'react';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';
import type { Token } from '@saberhq/token-utils';
import { Feature } from 'flagged';

import { useSendState } from 'app/contexts';
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
    isShowConfirmAddressSwitch,
    feeAmount,
  } = useSendState();

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
    setFromAmount(minorAmount);

    if (type === 'available') {
      trackEvent('send_available_click', { sum: Number(minorAmount) });
    } else {
      trackEvent('send_amount_keydown', { sum: Number(minorAmount) });
    }
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
          feeAmount={feeAmount}
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
            fee to create a {tokenSymbol} account for this address. You can choose which currency to
            pay in below.
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

      {/*<TextFieldStyled*/}
      {/*  label="Current price"*/}
      {/*  value={*/}
      {/*    <>*/}
      {/*      <RateUSD symbol={fromTokenAccount?.balance?.token.symbol} />{' '}*/}
      {/*      <span>&nbsp;per {fromTokenAccount?.balance?.token.symbol} </span>*/}
      {/*    </>*/}
      {/*  }*/}
      {/*/>*/}

      {/*<TransferFee />*/}
    </>
  );
};
