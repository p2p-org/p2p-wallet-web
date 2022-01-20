import type { FunctionComponent } from 'react';
import { useMemo } from 'react';
import * as React from 'react';
import Skeleton from 'react-loading-skeleton';
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

import { ModalType, useModals } from 'app/contexts/general/modals';
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

// const ClockIcon = styled(Icon)`
//   width: 15px;
//   height: 15px;
//   margin-left: 9px;
//
//   color: #ffa631;
// `;

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
  const { openModal } = useModals();
  const transaction = useTransaction(signature, source);

  const sourceTokenAccount = useTokenAccount(usePubkey(transaction?.data?.source));
  const destinationTokenAccount = useTokenAccount(usePubkey(transaction?.data?.destination));

  const tokenAmount = useTokenAccountAmount(
    usePubkey(transaction?.details.tokenAccount),
    transaction?.details.amount,
  );

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (['A', 'IMG'].includes((e.target as HTMLElement).tagName)) {
      return;
    }

    trackEvent('wallet_transaction_details_open');

    openModal(ModalType.SHOW_MODAL_TRANSACTION_DETAILS, { signature, source });
  };

  const bottomLeft = useMemo(() => {
    // show skeleton until all data needed in this look loaded
    if (transaction?.loading || sourceTokenAccount?.loading || destinationTokenAccount?.loading) {
      return <Skeleton width={70} height={16} />;
    }

    const type = transaction?.details.type;

    const source = transaction?.data?.source;
    const destination = transaction?.data?.destination;
    const sourceToken = sourceTokenAccount?.balance?.token;
    const destinationToken = destinationTokenAccount?.balance?.token;

    if (type === 'swap' && source && destination && sourceToken && destinationToken) {
      return (
        <>
          <LinkStyled to={`/wallet/${source}`}>{sourceToken.symbol}</LinkStyled> to{' '}
          <LinkStyled to={`/wallet/${destination}`}>{destinationToken.symbol}</LinkStyled>
        </>
      );
    }

    if (type === 'transfer') {
      const address = destination;
      if (address) {
        return `To ${shortAddress(address)}`;
      }
    }

    if (type === 'receive') {
      const address = source;
      if (address) {
        return `From ${shortAddress(address)}`;
      }
    }

    if (type === 'createAccount') {
      const symbol = destinationToken?.symbol;
      if (symbol) {
        return `${symbol} Created`;
      }
    }

    if (type === 'closeAccount') {
      const symbol = sourceToken?.symbol;
      if (symbol) {
        return `${symbol} Closed`;
      }
    }

    if (transaction) {
      return <div title={transaction.key}>{shortAddress(transaction.key)}</div>;
    }

    return null;
  }, [
    destinationTokenAccount?.balance?.token,
    destinationTokenAccount?.loading,
    sourceTokenAccount?.balance?.token,
    sourceTokenAccount?.loading,
    transaction,
  ]);

  return (
    <Wrapper>
      <Main onClick={handleClick}>
        {transaction?.data instanceof SwapTransaction ? (
          <SwapAvatars transaction={transaction} />
        ) : (
          <TransactionIconWrapper>
            {transaction?.loading ? (
              <Skeleton width={48} height={48} borderRadius={12} />
            ) : transaction?.details.icon ? (
              <TransactionIcon name={transaction?.details.icon} />
            ) : undefined}
          </TransactionIconWrapper>
        )}
        <Content>
          <Top>
            <Type>
              {transaction?.loading ? (
                <Skeleton width={50} height={16} />
              ) : (
                titleCase(transaction?.details.type)
              )}
            </Type>
            <Right>
              {transaction?.loading || tokenAmount?.loading ? (
                <Skeleton width={50} height={16} />
              ) : tokenAmount?.balance ? (
                <Amount className={classNames({ isReceiver: transaction?.details.isReceiver })}>
                  <AmountUSD
                    prefix={transaction?.details.isReceiver ? '+' : '-'}
                    value={tokenAmount.balance}
                  />
                </Amount>
              ) : undefined}
              {transaction?.raw?.meta?.err ? (
                <StatusWrapper title="Transaction failed">
                  <WarningIcon name="warning" />
                </StatusWrapper>
              ) : undefined}
              {/* TODO: add pending transaction*/}
              {/*{!transaction?.raw?.slot ? (*/}
              {/*  <StatusWrapper title="Transaction processing">*/}
              {/*    <ClockIcon name="clock" />*/}
              {/*  </StatusWrapper>*/}
              {/*) : undefined}*/}
            </Right>
          </Top>
          <Bottom>
            <div>{bottomLeft}</div>
            <div>
              {transaction?.loading || tokenAmount?.loading ? (
                <Skeleton width={70} height={16} />
              ) : tokenAmount?.balance ? (
                <>
                  {transaction?.details.isReceiver ? '+' : '-'} {tokenAmount.balance.formatUnits()}
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
