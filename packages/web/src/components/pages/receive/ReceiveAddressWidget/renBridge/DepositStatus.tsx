import type { FC } from 'react';
import React from 'react';

import { styled } from '@linaria/react';
import type {
  AcceptedGatewayTransaction,
  AllGatewayTransactions,
  ConfirmingGatewayTransaction,
  GatewayTransaction,
  MintedGatewayTransaction,
  SubmittingGatewayTransaction,
} from '@renproject/ren-tx';
import {
  DepositStates,
  isAccepted,
  isCompleted,
  isConfirming,
  isSubmitted,
} from '@renproject/ren-tx';

import { Accordion, Button } from 'components/ui';
import type { useLockAndMint } from 'utils/hooks/renBridge/useLockAndMint';
import { useDeposit } from 'utils/hooks/renBridge/useLockAndMint';

const StatusItems = styled.ul`
  margin: 0;
  padding: 0;

  list-style: none;
`;

const StatusItem = styled.li`
  display: flex;
  align-items: center;

  padding: 12px 0;

  border-bottom: 1px solid #f6f6f8;

  &:nth-last-child() {
    border-bottom: none;
  }
`;

const Status = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StatusTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const StatusTimestamp = styled.div`
  font-weight: 600;
  font-size: 14px;

  color: #a3a5ba;
`;

const StatusAction = styled.div``;

const DepositConfirmationStatus: FC<{
  targetConfirmations: number | string;
  sourceConfirmations: number;
  timestamp?: string;
}> = ({ targetConfirmations, sourceConfirmations, timestamp }) => {
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
        {timestamp && <StatusTimestamp>{timestamp}</StatusTimestamp>}
      </Status>
      <StatusAction>
        <StatusTitle style={style}>{`${sourceConfirmations} / ${targetConfirmations}`}</StatusTitle>
      </StatusAction>
    </StatusItem>
  );
};

const DepositStatusItem: FC<{
  value: DepositStates;
  deposit:
    | AcceptedGatewayTransaction<any>
    | AllGatewayTransactions<any>
    | ConfirmingGatewayTransaction<any>
    | GatewayTransaction<any>
    | MintedGatewayTransaction<any>
    | SubmittingGatewayTransaction<any>;
  mint: () => void;
  formatAmount: (amount: string) => number;
  timestamp?: string;
}> = ({ value, deposit, mint, formatAmount, timestamp }) => {
  switch (value) {
    case DepositStates.CONFIRMING_DEPOSIT:
      if (!isConfirming(deposit)) {
        throw new Error('inconsistent state');
      }
      return (
        <DepositConfirmationStatus
          sourceConfirmations={deposit.sourceTxConfs || 0}
          targetConfirmations={deposit.sourceTxConfTarget || '?'}
        />
      );

    case DepositStates.RENVM_SIGNING:
      if (!isConfirming(deposit)) {
        throw new Error('inconsistent state');
      }
      return (
        <StatusItem>
          <Status>
            <StatusTitle>Submitting to RenVM</StatusTitle>
            {timestamp && <StatusTimestamp>{timestamp}</StatusTimestamp>}
          </Status>
        </StatusItem>
      );
    case DepositStates.SUBMITTING_MINT:
    case DepositStates.RENVM_ACCEPTED:
      if (!isAccepted(deposit)) {
        throw new Error('inconsistent state');
      }
      return (
        <StatusItem>
          <Status>
            <StatusTitle>Awaiting the signature on your wallet</StatusTitle>
            {timestamp && <StatusTimestamp>{timestamp}</StatusTimestamp>}
          </Status>
          <StatusAction>
            <Button primary onClick={() => mint()}>{`Mint ${formatAmount(
              deposit.rawSourceTx?.amount,
            )} BTC`}</Button>
          </StatusAction>
        </StatusItem>
      );
    case DepositStates.MINTING:
      if (!isSubmitted(deposit)) {
        throw new Error('inconsistent state');
      }
      return (
        <StatusItem>
          <Status>
            <StatusTitle>Minting</StatusTitle>
            {timestamp && <StatusTimestamp>{timestamp}</StatusTimestamp>}
          </Status>
        </StatusItem>
      );
    case DepositStates.COMPLETED:
      if (!isCompleted(deposit)) {
        throw new Error('inconsistent state');
      }
      const outAmount = formatAmount((deposit.renResponse as any).amount.toNumber());
      return (
        <StatusItem>
          <Status>
            <StatusTitle>{`Successfully minted ${outAmount} renBTC!`}</StatusTitle>
            {timestamp && <StatusTimestamp>{timestamp}</StatusTimestamp>}
          </Status>
          <StatusAction>
            <StatusTitle style={{ color: '#4caf50' }}>{`+${outAmount} renBTC`}</StatusTitle>
          </StatusAction>
        </StatusItem>
      );
    case DepositStates.ERROR_MINTING:
    case DepositStates.ERROR_SIGNING:
    case DepositStates.ERROR_RESTORING:
    case DepositStates.REJECTED:
      return (
        <StatusItem>
          <Status>
            <StatusTitle style={{ color: '#ff5959' }}>
              {deposit.error?.toString() || ''}
            </StatusTitle>
          </Status>
        </StatusItem>
      );
    default:
      return (
        <StatusItem>
          <Status>
            <StatusTitle>Unknown state</StatusTitle>
          </Status>
        </StatusItem>
      );
  }
};

export const DepositStatus: FC<{
  session: ReturnType<typeof useLockAndMint>;
  depositId: string;
}> = ({ session, depositId }) => {
  const machine = useDeposit(session, depositId);
  if (!machine) return null;

  return (
    <Accordion title="Receiving statuses" open>
      <StatusItems>
        <DepositStatusItem {...machine} />
      </StatusItems>
    </Accordion>
  );
};
