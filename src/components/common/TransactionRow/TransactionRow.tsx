import React, { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { TransactionSignature } from '@solana/web3.js';
import dayjs from 'dayjs';
import { rgba } from 'polished';

import { Transaction } from 'api/transaction/Transaction';
import { Avatar } from 'components/ui';
import { openModal } from 'store/_actions/modals';
import { SHOW_MODAL_TRANSACTION_DETAILS } from 'store/constants/modalTypes';
import { RootState } from 'store/rootReducer';

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
  signature: TransactionSignature;
};

export const TransactionRow: FunctionComponent<Props> = ({ signature }) => {
  const dispatch = useDispatch();
  const transaction = useSelector(
    (state: RootState) =>
      state.transaction.items[signature] && Transaction.from(state.transaction.items[signature]),
  );

  const handleClick = () => {
    dispatch(openModal(SHOW_MODAL_TRANSACTION_DETAILS, { signature }));
  };

  return (
    <Wrapper>
      <Main onClick={handleClick}>
        <AvatarStyled />
        <Content>
          <Top>
            <Type>{transaction.short.type}</Type>
            <AmountUSDT
              value={transaction.short.amount}
              symbol={transaction.short.sourceTokenAccount?.mint.symbol}
            />
          </Top>
          <Bottom>
            <div title={`${transaction.slot} SLOT`}>
              {transaction.timestamp
                ? dayjs.unix(transaction.timestamp).format('LLL')
                : `${transaction.slot} SLOT`}
            </div>
            <div>
              {transaction.short.amount.toNumber()}{' '}
              {transaction.short.sourceTokenAccount?.mint.symbol}
            </div>
          </Bottom>
        </Content>
      </Main>
    </Wrapper>
  );
};
