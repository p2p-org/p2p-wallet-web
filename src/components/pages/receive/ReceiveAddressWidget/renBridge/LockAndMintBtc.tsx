import React, { FC, useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import { Bitcoin } from '@renproject/chains-bitcoin';
import { getRenNetworkDetails } from '@renproject/interfaces';
import { DepositStates } from '@renproject/ren-tx';

import { LoaderBlock } from 'components/common/LoaderBlock';
import { Icon } from 'components/ui';
import { Accordion, Button } from 'components/ui';
import { getFormattedHMS } from 'utils/dates';
import { getRemainingGatewayTime } from 'utils/hooks/renBridge/useLockAndMint';
import { DepositTranstaction, formatAmount } from 'utils/hooks/renBridge/useLockAndMint';
import { useRenNetwork } from 'utils/hooks/renBridge/useNetwork';
import { useIntervalHook } from 'utils/hooks/useIntervalHook';
import { useLockAndMintProvider } from 'utils/providers/LockAndMintProvider';

import { AddressQRCodePanel } from '../AddressQRCodePanel';
import { Description } from '../styled';

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

const StatusAction = styled.div``;

const GatewayInfoWrapper = styled.div`
  display: flex;

  padding: 12px;

  background: rgba(163, 165, 186, 0.05);
  border-radius: 12px;
`;

const AttentionIcon = styled(Icon)`
  width: 36px;
  height: 36px;
  margin-bottom: 14px;
`;

const GatewayInfoItems = styled.ul`
  margin: 0;

  list-style: square;
`;

const GatewayInfoItem = styled.li``;

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
        <StatusTitle>{`Successfully minted ${outAmount} renBtc!`}</StatusTitle>
      </Status>
      <StatusAction>
        <StatusTitle style={{ color: '#4caf50' }}>{`+${outAmount} renBTC`}</StatusTitle>
      </StatusAction>
    </StatusItem>,
  );
  return states;
};

const DepositConfirmationStatus: FC<{
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

const HMSCountdown: FC<{ milliseconds: number }> = ({ milliseconds }) => {
  const [count, setCount] = useState(milliseconds);
  useIntervalHook(() => {
    if (count > 0) {
      setCount((ms) => ms - 1000);
    }
  }, 1000);
  const time = getFormattedHMS(count);

  return <strong>{time}</strong>;
};

export const LockAndMintBtc: FC = () => {
  const network = useRenNetwork();
  const targetConfirmationsCount = useMemo(() => {
    return getRenNetworkDetails(network).isTestnet ? 1 : 6;
  }, [network]);

  const lockAndMintProvider = useLockAndMintProvider();
  if (!lockAndMintProvider.isConfigInitialized) {
    lockAndMintProvider.initializeConfig();
  }

  if (!lockAndMintProvider.gatewayAddress) {
    return <LoaderBlock />;
  }

  const timeRemained = getRemainingGatewayTime(lockAndMintProvider.expiryTime);

  return (
    <>
      <Description>
        <GatewayInfoWrapper>
          <AttentionIcon name="attention" />
          <GatewayInfoItems>
            <GatewayInfoItem>
              This address accepts <strong>only Bitcoin</strong>. You may lose assets by sending
              another coin.
            </GatewayInfoItem>
            <GatewayInfoItem>
              Minimum transaction amount of{' '}
              <strong>{`${(lockAndMintProvider.fee / 10 ** 8) * 2} ${Bitcoin.asset}`}</strong>.
            </GatewayInfoItem>
            <GatewayInfoItem>
              <HMSCountdown milliseconds={timeRemained} /> is the remaining time to safely send the
              assets.
            </GatewayInfoItem>
          </GatewayInfoItems>
        </GatewayInfoWrapper>
      </Description>
      <AddressQRCodePanel address={lockAndMintProvider.gatewayAddress} />
      <Description>
        {Object.keys(lockAndMintProvider.deposits).map((depositId) => (
          <DepositStatus
            key={depositId}
            {...lockAndMintProvider.deposits[depositId]}
            targetConfirmationsCount={targetConfirmationsCount}
          />
        ))}
      </Description>
    </>
  );
};
