import type { FC } from 'react';

import { Status, StatusAction, StatusItem, StatusTitle } from '../common/styled';

export const DepositConfirmationStatus: FC<{
  targetConfirmations: number | string;
  sourceConfirmations: number;
}> = ({ targetConfirmations, sourceConfirmations }) => {
  const style: Partial<{ color: string }> = {};

  if (sourceConfirmations === 0) {
    style.color = '#ff5959';
  } else if (sourceConfirmations === targetConfirmations) {
    style.color = '#4caf50';
  }

  return (
    <StatusItem>
      <Status>
        <StatusTitle>Waiting for deposit confirmation</StatusTitle>
      </Status>
      <StatusAction>
        <StatusTitle style={style}>{`${sourceConfirmations} / ${targetConfirmations}`}</StatusTitle>
      </StatusAction>
    </StatusItem>
  );
};
