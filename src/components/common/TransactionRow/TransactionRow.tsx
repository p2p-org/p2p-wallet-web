import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';
import classNames from 'classnames';
import { rgba } from 'polished';

import { Transaction } from 'api/transaction/Transaction';
import { Icon } from 'components/ui';
import { openModal } from 'store/actions/modals';
import { SHOW_MODAL_TRANSACTION_DETAILS } from 'store/constants/modalTypes';
import { shortAddress } from 'utils/tokens';

import { AmountUSD } from '../AmountUSD';
import { TokenAvatar } from '../TokenAvatar';

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

const TransactionIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 12px;

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

const Amount = styled.div`
  &.isReceiver {
    color: #2db533;
  }
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

const RightIcon = styled(Icon)`
  width: 14px;
  height: 14px;
  margin: 0 6px;

  color: #a3a5ba;

  transform: rotate(-90deg);
`;

type Props = {
  transaction: Transaction;
  source: PublicKey;
};

export const TransactionRow: FunctionComponent<Props> = ({ transaction, source }) => {
  const dispatch = useDispatch();
  const details = transaction.details(transaction.short.destination?.equals(source));

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (['A', 'IMG'].includes((e.target as HTMLElement).tagName)) {
      return;
    }

    void dispatch(
      openModal({
        modalType: SHOW_MODAL_TRANSACTION_DETAILS,
        props: { signature: transaction.signature, source },
      }),
    );
  };

  const renderBottomLeft = () => {
    if (details.type === 'swap') {
      return (
        <>
          <Link to={`/wallet/${details.sourceTokenAccount?.address.toBase58()}`}>
            <TokenAvatar
              title={details.sourceTokenAccount?.mint.symbol}
              symbol={details.sourceTokenAccount?.mint.symbol}
              size={18}
            />
          </Link>
          <RightIcon name="chevron" />
          <Link to={`/wallet/${details.destinationTokenAccount?.address.toBase58()}`}>
            <TokenAvatar
              title={details.destinationTokenAccount?.mint.symbol}
              symbol={details.destinationTokenAccount?.mint.symbol}
              size={18}
            />
          </Link>
        </>
      );
    }

    if (details.type === 'transfer') {
      const address = details.destinationTokenAccount?.address.toBase58();
      if (address) {
        return `To ${shortAddress(address)}`;
      }
    }

    if (details.type === 'receive') {
      const address = details.sourceTokenAccount?.address.toBase58();
      if (address) {
        return `From ${shortAddress(address)}`;
      }
    }

    if (details.typeOriginal === 'createAccount') {
      const symbol = details.destinationTokenAccount?.mint.symbol;
      if (symbol) {
        return `${symbol} Created`;
      }
    }

    if (details.typeOriginal === 'closeAccount') {
      const symbol = details.sourceTokenAccount?.mint.symbol;
      if (symbol) {
        return `${symbol} Closed`;
      }
    }
  };

  return (
    <Wrapper>
      <Main onClick={handleClick}>
        <TransactionIconWrapper>
          {details.icon ? <TransactionIcon name={details.icon} /> : undefined}
        </TransactionIconWrapper>
        <Content>
          <Top>
            <Type>{details.type}</Type>
            <Amount className={classNames({ isReceiver: details.isReceiver })}>
              <AmountUSD
                prefix={details.isReceiver ? '+' : '-'}
                value={details.destinationAmount}
                symbol={details.tokenAccount?.mint.symbol}
              />
            </Amount>
          </Top>
          <Bottom>
            <div>{renderBottomLeft()}</div>
            <div>
              {details.isReceiver ? '+' : '-'} {details.amount.toNumber()}{' '}
              {details.tokenAccount?.mint.symbol}
            </div>
          </Bottom>
        </Content>
      </Main>
    </Wrapper>
  );
};
