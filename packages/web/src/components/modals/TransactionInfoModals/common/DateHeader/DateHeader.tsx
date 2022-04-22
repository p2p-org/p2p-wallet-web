import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui/dist/esm';
import dayjs from 'dayjs';

export const Time = styled.div`
  color: ${theme.colors.textIcon.primary};
`;

// @FIXME probably you might need to move it to TransactionInfoModals/common
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
  const today = new Date();
  const utcDiff = today.getHours() - today.getUTCHours();

  return (
    <DateHeaderWrapper>
      <span>{dayjs().format('MMMM D, YYYY')}</span>
      <Time>{dayjs().format('hh:mm:ss')}</Time>
      <span>
        (UTC{utcDiff >= 0 ? '+' : '-'}
        {utcDiff})
      </span>
    </DateHeaderWrapper>
  );
};

export default DateHeader;
