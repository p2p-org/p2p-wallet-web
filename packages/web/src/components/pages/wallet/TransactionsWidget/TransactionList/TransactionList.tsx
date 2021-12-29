import type { FunctionComponent } from 'react';
import { useMemo } from 'react';

import { styled } from '@linaria/react';
import type { ConfirmedSignatureInfo } from '@solana/web3.js';
import dayjs from 'dayjs';

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

type Props = {
  signatures?: ConfirmedSignatureInfo[];
  source: string;
};

export const TransactionList: FunctionComponent<Props> = ({ signatures, source }) => {
  const groupedSignatures = useMemo(() => {
    if (!signatures) {
      return [];
    }

    const txs: { date: string | null; items: ConfirmedSignatureInfo[] }[] = [];
    let group: ConfirmedSignatureInfo[] = [];
    let lastDate: string | null = null;

    signatures.forEach((signature, index) => {
      const currentDate = signature.blockTime
        ? new Date(signature.blockTime * 1000).toDateString()
        : null;

      if (currentDate !== lastDate && group.length > 0) {
        txs.push({
          date: lastDate,
          items: group,
        });
        group = [signature];
      } else if (signatures.length === index + 1) {
        group.push(signature);
        txs.push({
          date: currentDate,
          items: group,
        });
      } else {
        group.push(signature);
      }

      lastDate = currentDate;
    });

    return txs;

    // TODO: right transactions dep
  }, [signatures]);

  if (!groupedSignatures) {
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
      {groupedSignatures.map((group) => (
        <Group key={group.date}>
          {renderDate(group.date, dates)}
          {group.items.map((signature) => (
            <TransactionRow
              key={signature.signature}
              signature={signature.signature}
              source={source}
            />
          ))}
        </Group>
      ))}
    </Wrapper>
  );
};
