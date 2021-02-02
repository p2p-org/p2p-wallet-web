import React, { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { rgba } from 'polished';

import { Transaction } from 'api/transaction/Transaction';
import { Avatar } from 'components/ui';
import { openModal } from 'store/actions/modals';
import { SHOW_MODAL_TRANSACTION_DETAILS } from 'store/constants/modalTypes';

import { AmountUSDT } from '../AmountUSDT';

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

const AvatarStyled = styled(Avatar)`
  width: 48px;
  height: 48px;
  margin-right: 12px;

  background: #f6f6f8;
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

const Type = styled.div``;

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

    ${AvatarStyled} {
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

type Props = {
  transaction: Transaction;
  source: PublicKey;
};

export const TransactionRow: FunctionComponent<Props> = ({ transaction, source }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(openModal(SHOW_MODAL_TRANSACTION_DETAILS, { signature: transaction.signature }));
  };

  const isReceiver = transaction.short.destination?.equals(source);

  return (
    <Wrapper>
      <Main onClick={handleClick}>
        <AvatarStyled />
        <Content>
          <Top>
            <Type>{transaction.short.type}</Type>
            <Amount className={classNames({ isReceiver })}>
              <AmountUSDT
                prefix={isReceiver ? '+' : '-'}
                value={transaction.short.amount}
                symbol={transaction.short.sourceTokenAccount?.mint.symbol}
              />
            </Amount>
          </Top>
          <Bottom>
            <div title={`${transaction.slot} SLOT`}>
              {transaction.timestamp
                ? dayjs.unix(transaction.timestamp).format('LLL')
                : `${transaction.slot} SLOT`}
            </div>
            <div>
              {isReceiver ? '+' : '-'} {transaction.short.amount.toNumber()}{' '}
              {transaction.short.sourceTokenAccount?.mint.symbol}
            </div>
          </Bottom>
        </Content>
      </Main>
    </Wrapper>
  );
};
