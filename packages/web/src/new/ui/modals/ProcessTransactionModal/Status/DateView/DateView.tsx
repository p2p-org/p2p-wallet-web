import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';

import type { ProcessTransactionModalViewModel } from '../../ProcessTransactionModal.ViewModel';

const Time = styled.div`
  color: ${theme.colors.textIcon.primary};
`;

const DateHeaderWrapper = styled.div`
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

interface Props {
  viewModel: Readonly<ProcessTransactionModalViewModel>;
}

export const DateView: FC<Props> = observer(({ viewModel }) => {
  const sentAt = viewModel.pendingTransaction!.sentAt;

  return (
    <DateHeaderWrapper>
      <span>{dayjs(sentAt).format('MMMM D, YYYY')}</span>
      <Time>{dayjs(sentAt).format('hh:mm:ss')}</Time>
      <span>(UTC {dayjs(sentAt).format('Z')})</span>
    </DateHeaderWrapper>
  );
});
