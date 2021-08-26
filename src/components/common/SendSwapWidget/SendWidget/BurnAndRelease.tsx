import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { Bitcoin } from '@renproject/chains-bitcoin';
import { Solana } from '@renproject/chains-solana';
import { RenNetwork } from '@renproject/interfaces';
import RenJS from '@renproject/ren';
import { BurnSession, BurnStates, BurnTransaction, isBurnErroring } from '@renproject/ren-tx';
import { Transaction } from '@solana/web3.js';

import { getConnection } from 'api/connection';
import { getWallet } from 'api/wallet';
import { Accordion, Button } from 'components/ui';
import { useBurnAndRelease } from 'utils/hooks/renBridge/useBurnAndRelease.ts';

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
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
`;

const StatusAction = styled.div``;

const BurnStatusItem: FC<{
  value: BurnStates;
  session: BurnSession<any, any>;
  burn: () => void;
  tx: BurnTransaction | undefined;
  formatAmount: (amount: string) => number;
  timestamp?: string;
}> = ({ value, session, tx, burn, formatAmount, timestamp }) => {
  switch (value) {
    case BurnStates.CREATED:
      return (
        <StatusItem>
          <Status>
            <StatusTitle>Awaiting the signature on your wallet</StatusTitle>
            {timestamp && <StatusTimestamp>{timestamp}</StatusTimestamp>}
          </Status>
          <StatusAction>
            <Button primary onClick={() => burn()}>{`Burn ${formatAmount(session.targetAmount)} ${
              session.sourceAsset
            }`}</Button>
          </StatusAction>
        </StatusItem>
      );
    case BurnStates.CONFIRMING_BURN:
      if (!tx) return <div>loading</div>;
      return (
        <StatusItem>
          <Status>
            <StatusTitle>Waiting for burn confirmation</StatusTitle>
            {timestamp && <StatusTimestamp>{timestamp}</StatusTimestamp>}
          </Status>
          <StatusAction>
            <StatusTitle>{`${tx.sourceTxConfs} / ${tx.sourceTxConfTarget}`}</StatusTitle>
          </StatusAction>
        </StatusItem>
      );
    case BurnStates.RENVM_RELEASING:
      return (
        <StatusItem>
          <Status>
            <StatusTitle>Submitting to RenVM</StatusTitle>
            {timestamp && <StatusTimestamp>{timestamp}</StatusTimestamp>}
          </Status>
        </StatusItem>
      );
    case BurnStates.RENVM_ACCEPTED:
      return (
        <StatusItem>
          <Status>
            <StatusTitle>Releasing</StatusTitle>
            {timestamp && <StatusTimestamp>{timestamp}</StatusTimestamp>}
          </Status>
        </StatusItem>
      );
    case BurnStates.RELEASED:
      return (
        <StatusItem>
          <Status>
            <StatusTitle>Released</StatusTitle>
            {timestamp && <StatusTimestamp>{timestamp}</StatusTimestamp>}
          </Status>
        </StatusItem>
      );
    case BurnStates.ERROR_BURNING:
      if (!isBurnErroring(session)) return <div>loading</div>;
      return (
        <StatusItem>
          <Status>
            <StatusTitle style={{ color: '#ff5959' }}>{session.error.message}</StatusTitle>
          </Status>
        </StatusItem>
      );
    case BurnStates.ERROR_RELEASING:
      return <div>Rejected</div>;
    default:
      return <div>Loading</div>;
  }
};

type Props = {
  destinationAddress: string;
  targetAmount: string;
};

export const BurnAndRelease: FC<Props> = ({ destinationAddress, targetAmount }) => {
  const cluster = useSelector((state) => state.wallet.network.cluster);

  const burnAndReleaseProps = useMemo(() => {
    const network = cluster === 'mainnet-beta' ? RenNetwork.Mainnet : RenNetwork.Testnet;

    const amount = String(Math.floor(Number(targetAmount) * Math.pow(10, 8)));

    return {
      sdk: new RenJS(network, {
        useV2TransactionFormat: false,
        loadCompletedDeposits: true,
      }),
      burnParams: {
        sourceAsset: Bitcoin.asset,
        network,
        destinationAddress,
        targetAmount,
      },
      userAddress: getWallet().pubkey.toBase58(),
      from: new Solana(
        {
          connection: getConnection(),
          wallet: {
            publicKey: getWallet().pubkey,
            signTransaction: (tx: Transaction) => getWallet().sign(tx),
          },
        },
        network,
      ).Account({
        address: getWallet().pubkey.toBase58(),
        value: amount,
        amount,
      }),
      to: new Bitcoin().Address(destinationAddress),
      autoSubmit: true,
    };
  }, [cluster, destinationAddress, targetAmount]);

  const machine = useBurnAndRelease(burnAndReleaseProps);
  if (!machine) return null;

  return (
    <Accordion title="Receiving statuses" open>
      <StatusItems>
        <BurnStatusItem {...machine} />
      </StatusItems>
    </Accordion>
  );
};
