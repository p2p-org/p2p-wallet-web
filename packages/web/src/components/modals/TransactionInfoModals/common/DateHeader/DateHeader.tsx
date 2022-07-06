import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import dayjs from 'dayjs';

export const Time = styled.div`
  color: ${theme.colors.textIcon.primary};
`;

export const DateHeaderWrapper = styled.div`
  display: flex;
  justify-content: center;

  color: ${theme.colors.textIcon.secondary};

  font-weight: 500;
  font-size: 14px;
  line-height: 120%;

  & > *:not(:first-child) {
    margin-left: 4px;
  }
`;
export const DateHeader: FC = () => {
  const [today] = useState(new Date());
  const [date] = useState(dayjs().format('MMMM D, YYYY'));
  const [time] = useState(dayjs().format('hh:mm:ss'));

  const utcDiff = today.getHours() - today.getUTCHours();

  return (
    <DateHeaderWrapper>
      <span>{date}</span>
      <Time>{time}</Time>
      <span>
        (UTC{utcDiff >= 0 ? '+' : '-'}
        {utcDiff})
      </span>
    </DateHeaderWrapper>
  );
};

export default DateHeader;
