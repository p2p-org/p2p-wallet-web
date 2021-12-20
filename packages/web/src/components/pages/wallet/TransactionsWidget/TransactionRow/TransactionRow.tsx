import type { FunctionComponent } from 'react';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import {
  SwapTransaction,
  titleCase,
  useTokenAccount,
  useTokenAccountAmount,
  useTransaction,
} from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import classNames from 'classnames';
import { rgba } from 'polished';

import { AmountUSD } from 'components/common/AmountUSD';
import { SwapAvatars } from 'components/pages/wallet/TransactionsWidget/TransactionRow/swap/SwapAvatars';
import { Icon } from 'components/ui';
import { trackEvent } from 'utils/analytics';
import { shortAddress } from 'utils/tokens';

import { BaseWrapper } from './common/styled';

const Wrapper = styled.div`
  position: relative;

  padding: 10px 0;

  &:not(:last-child) {
    &::after {
      position: absolute;
      right: 10px;
      bottom: 0;
      left: 10px;

      border-bottom: 1px solid ${rgba(0, 0, 0, 0.05)};

      content: '';
    }
  }
`;

const TransactionIconWrapper = styled(BaseWrapper)`
  display: flex;
  align-items: center;
  justify-content: center;

  background: #f6f6f8;
  border-radius: 12px;
`;

const TransactionIcon = styled(Icon)`
  width: 25px;
  height: 25px;

  color: #a3a5ba;
`;

const Content = styled.div`
  flex: 1;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const Type = styled.div`
  text-transform: capitalize;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

const Amount = styled.div`
  &.isReceiver {
    color: #2db533;
  }
`;

const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WarningIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-left: 9px;

  color: #f43d3d;
`;

const ClockIcon = styled(Icon)`
  width: 15px;
  height: 15px;
  margin-left: 9px;

  color: #ffa631;
`;

const Main = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;

  cursor: pointer;

  &:hover {
    background: #f6f6f8;
    border-radius: 12px;

    ${TransactionIconWrapper} {
      background: #fff;
    }

    ${Type} {
      color: #5887ff;
    }
  }
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`;

const LinkStyled = styled(Link)`
  color: #a3a5ba;
  text-decoration: none;
`;

type Props = {
  signature: string;
  source: string;
};

export const TransactionRow: FunctionComponent<Props> = ({ signature, source }) => {
  const transaction = useTransaction(signature, source);

  const sourceTokenAccount = useTokenAccount(usePubkey(transaction?.data?.source));
  const destinationTokenAccount = useTokenAccount(usePubkey(transaction?.data?.destination));

  const tokenAmount = useTokenAccountAmount(
    transaction?.details.tokenAccount,
    transaction?.details.amount,
  );

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (['A', 'IMG'].includes((e.target as HTMLElement).tagName)) {
      return;
    }

    trackEvent('wallet_transaction_details_open');

    // void dispatch(
    //   openModal({
    //     modalType: SHOW_MODAL_TRANSACTION_DETAILS,
    //     props: { signature, source },
    //   }),
    // );
  };

  const bottomLeft = useMemo(() => {
    if (
      transaction?.details.type === 'swap' &&
      sourceTokenAccount?.balance?.token &&
      destinationTokenAccount?.balance?.token
    ) {
      return (
        <>
          <LinkStyled to={`/wallet/${sourceTokenAccount.key.toBase58()}`}>
            {sourceTokenAccount.balance.token.symbol}
          </LinkStyled>{' '}
          to{' '}
          <LinkStyled to={`/wallet/${destinationTokenAccount.key.toBase58()}`}>
            {destinationTokenAccount.balance.token.symbol}
          </LinkStyled>
        </>
      );
    }

    if (transaction?.details.type === 'transfer') {
      const address = destinationTokenAccount?.key?.toBase58();
      if (address) {
        return `To ${shortAddress(address)}`;
      }
    }

    if (transaction?.details.type === 'receive') {
      const address = sourceTokenAccount?.key?.toBase58();
      if (address) {
        return `From ${shortAddress(address)}`;
      }
    }

    if (transaction?.details.type === 'createAccount') {
      const symbol = destinationTokenAccount?.balance?.token?.symbol;
      if (symbol) {
        return `${symbol} Created`;
      }
    }

    if (transaction?.details.type === 'closeAccount') {
      const symbol = sourceTokenAccount?.balance?.token?.symbol;
      if (symbol) {
        return `${symbol} Closed`;
      }
    }

    if (transaction) {
      return <div title={transaction.key}>{shortAddress(transaction.key)}</div>;
    }

    return null;
  }, [destinationTokenAccount, sourceTokenAccount, transaction]);

  return (
    <Wrapper>
      <Main onClick={handleClick}>
        {transaction?.data instanceof SwapTransaction ? (
          <SwapAvatars transaction={transaction} />
        ) : (
          <TransactionIconWrapper>
            {transaction?.details.icon ? (
              <TransactionIcon name={transaction?.details.icon} />
            ) : undefined}
          </TransactionIconWrapper>
        )}
        <Content>
          <Top>
            <Type>{titleCase(transaction?.details.type)}</Type>
            <Right>
              {tokenAmount ? (
                <Amount className={classNames({ isReceiver: transaction?.details.isReceiver })}>
                  <AmountUSD
                    prefix={transaction?.details.isReceiver ? '+' : '-'}
                    value={tokenAmount}
                  />
                </Amount>
              ) : undefined}
              {transaction?.raw?.meta?.err ? (
                <StatusWrapper title="Transaction failed">
                  <WarningIcon name="warning" />
                </StatusWrapper>
              ) : undefined}
              {!transaction?.raw?.slot ? (
                <StatusWrapper title="Transaction processing">
                  <ClockIcon name="clock" />
                </StatusWrapper>
              ) : undefined}
            </Right>
          </Top>
          <Bottom>
            <div>{bottomLeft}</div>
            <div>
              {tokenAmount ? (
                <>
                  {transaction?.details.isReceiver ? '+' : '-'} {tokenAmount.formatUnits()}
                </>
              ) : (
                <>#{transaction?.raw?.slot}</>
              )}
            </div>
          </Bottom>
        </Content>
      </Main>
    </Wrapper>
  );
};
