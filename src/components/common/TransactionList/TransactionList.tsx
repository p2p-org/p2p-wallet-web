import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { TransactionSignature } from '@solana/web3.js';
import dayjs from 'dayjs';

import { Transaction } from 'api/transaction/Transaction';
import { RootState } from 'store/rootReducer';

import { TransactionRow } from '../TransactionRow';

const Wrapper = styled.div`
  margin: 0 10px;
`;

const Group = styled.div`
  margin-top: 10px;

  &:first-child {
    margin-top: 20px;
  }
`;

const TitleDate = styled.div`
  margin: 0 10px;

  color: #a3a5ba;
  font-size: 14px;
  line-height: 16px;
`;

type Dates = {
  today: string;
  yesterday: string;
};

type Props = {
  order?: TransactionSignature[];
};

const renderDate = (currentDate: string | null, dates: Dates) => {
  let dateHeader = null;

  switch (currentDate) {
    case dates.today:
      dateHeader = 'Today';
      break;
    case dates.yesterday:
      dateHeader = 'Yesterday';
      break;
    default:
      dateHeader = currentDate ? dayjs(currentDate).format('LL') : null;
  }

  if (!dateHeader) {
    return null;
  }

  return <TitleDate>{dateHeader}</TitleDate>;
};

export const TransactionList: FunctionComponent<Props> = ({ order }) => {
  const transactions = useSelector((state: RootState) => state.transaction.items);

  const groupedTransactions = useMemo(() => {
    if (!order) {
      return [];
    }

    const txs: { date: string | null; items: Transaction[] }[] = [];
    let group: Transaction[] = [];
    let lastDate: string | null = null;

    order.forEach((signature) => {
      const transaction = transactions[signature]
        ? Transaction.from(transactions[signature])
        : undefined;

      if (!transaction) {
        return;
      }

      const currentDate = transaction.timestamp
        ? new Date(transaction.timestamp * 1000).toDateString()
        : null;

      if (currentDate !== lastDate && group.length > 0) {
        txs.push({
          date: lastDate,
          items: group,
        });
        group = [];
      } else {
        group.push(transaction);
      }

      lastDate = currentDate;
    });

    return txs;

    // TODO: right transactions dep
  }, [order, transactions]);

  if (!groupedTransactions) {
    return null;
  }

  const nowDate = new Date();
  const yesterdayDate = new Date(nowDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const dates: Dates = {
    today: nowDate.toDateString(),
    yesterday: yesterdayDate.toDateString(),
  };

  return (
    <Wrapper>
      {groupedTransactions.map((group) => (
        <Group>
          {renderDate(group.date, dates)}
          {group.items.map((transaction) => (
            <TransactionRow key={transaction.signature} transaction={transaction} />
          ))}
        </Group>
      ))}
    </Wrapper>
  );
};
