import type { FC } from 'react';
import * as React from 'react';

import { DepositStates } from '@renproject/ren-tx';

import { Accordion, Button } from 'components/ui';
import type { DepositTranstaction } from 'utils/hooks/renBridge/useLockAndMint';
import { formatAmount } from 'utils/hooks/renBridge/useLockAndMint';

import { Status, StatusAction, StatusItem, StatusTitle } from './common/styled';
import { DepositConfirmationStatus } from './DepositConfirmationStatus';

const renderStates = ({
  currentState,
  deposit,
  targetConfirmationsCount,
  mint,
}: {
  currentState: DepositStates;
  deposit: DepositTranstaction;
  mint: () => void;
  targetConfirmationsCount: number;
}) => {
  const states: Array<React.ReactNode> = [];

  if (currentState === DepositStates.RESTORING_DEPOSIT) {
    return states;
  }

  const confirmations =
    deposit.sourceTxConfs < targetConfirmationsCount
      ? targetConfirmationsCount - deposit.sourceTxConfs
      : 0;
  for (let i = 0; i <= targetConfirmationsCount - confirmations; i++) {
    states.push(
      <DepositConfirmationStatus
        key={i}
        sourceConfirmations={i}
        targetConfirmations={targetConfirmationsCount}
      />,
    );
  }
  if (currentState === DepositStates.CONFIRMING_DEPOSIT) {
    return states;
  }

  states.push(
    <StatusItem key={DepositStates.RENVM_SIGNING}>
      <Status>
        <StatusTitle>Submitting to RenVM</StatusTitle>
      </Status>
    </StatusItem>,
  );
  if (currentState === DepositStates.RENVM_SIGNING) {
    return states;
  }

  states.push(
    <StatusItem key={DepositStates.RENVM_ACCEPTED}>
      <Status>
        <StatusTitle>Awaiting the signature on your wallet</StatusTitle>
      </Status>
      <StatusAction>
        <Button primary onClick={mint} disabled={currentState !== DepositStates.RENVM_ACCEPTED}>
          {`Mint ${formatAmount(deposit.rawSourceTx.amount)} BTC`}
        </Button>
      </StatusAction>
    </StatusItem>,
  );
  if (
    currentState === DepositStates.SUBMITTING_MINT ||
    currentState === DepositStates.RENVM_ACCEPTED
  ) {
    return states;
  }

  states.push(
    <StatusItem key={DepositStates.MINTING}>
      <Status>
        <StatusTitle>Minting</StatusTitle>
      </Status>
    </StatusItem>,
  );
  if (currentState === DepositStates.MINTING) {
    return states;
  }

  const rewAmount =
    (deposit.renResponse?.out as any)?.amount?.toNumber() ||
    (deposit.renResponse as any)?.amount?.toNumber();
  const outAmount = formatAmount(rewAmount);
  states.push(
    <StatusItem key={DepositStates.COMPLETED}>
      <Status>
        <StatusTitle>{`Successfully minted ${outAmount} renBTC!`}</StatusTitle>
      </Status>
      <StatusAction>
        <StatusTitle style={{ color: '#4caf50' }}>{`+${outAmount} renBTC`}</StatusTitle>
      </StatusAction>
    </StatusItem>,
  );
  return states;
};

export const DepositStatus: FC<{
  currentState: DepositStates;
  deposit: DepositTranstaction;
  mint: () => void;
  targetConfirmationsCount: number;
}> = (props) => {
  return (
    <Accordion title="Receiving statuses" open>
      {renderStates({ ...props }).reverse()}
    </Accordion>
  );
};
