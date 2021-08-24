import React, { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { Bitcoin } from '@renproject/chains-bitcoin';
import { Solana } from '@renproject/chains-solana';
import { RenNetwork } from '@renproject/interfaces';
import RenJS from '@renproject/ren';
import { isOpen } from '@renproject/ren-tx';
import { Transaction } from '@solana/web3.js';

import { getConnection } from 'api/connection';
import { getWallet } from 'api/wallet';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { Icon } from 'components/ui';
import { getFormattedHMS } from 'utils/dates';
import { getRemainingGatewayTime, useLockAndMint } from 'utils/hooks/renBridge/useLockAndMint';
import { useIntervalHook } from 'utils/hooks/useIntervalHook';

import { AddressQRCodePanel } from '../AddressQRCodePanel';
import { Description } from '../styled';
import { DepositStatus } from './DepositStatus';

const SOURCE_ASSET = 'BTC';

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

const makeSolanaProvider = () => ({
  connection: getConnection(),
  wallet: {
    publicKey: getWallet().pubkey,
    signTransaction: async (tx: Transaction) => getWallet().sign(tx),
  },
});

const HMSCountdown: FC<{ milliseconds: number }> = ({ milliseconds }) => {
  const [count, setCount] = useState(milliseconds);
  useIntervalHook(() => {
    setCount((ms) => ms - 1000);
  }, 1000);
  const time = getFormattedHMS(count);

  return <strong>{time}</strong>;
};

export const ReceiveBtc: FC = () => {
  const cluster = useSelector((state) => state.wallet.network.cluster);
  const [timeRemained, setTimeRemained] = useState(0);
  const [lockfee, setLockFee] = useState(0);

  const lockAndMintParams = useMemo(() => {
    const network = cluster === 'mainnet-beta' ? RenNetwork.Mainnet : RenNetwork.Testnet;
    return {
      sdk: new RenJS(network),
      mintParams: {
        sourceAsset: SOURCE_ASSET,
        network,
        destAddress: getWallet().pubkey.toBase58(),
      },
      from: new Bitcoin(),
      to: new Solana(makeSolanaProvider(), network),
    };
  }, [cluster]);

  const mint = useLockAndMint(lockAndMintParams);

  useEffect(() => {
    setTimeRemained(getRemainingGatewayTime(mint.session.expiryTime));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTimeRemained]);

  useEffect(() => {
    void (async () => {
      const fees = await lockAndMintParams.sdk.getFees({
        asset: SOURCE_ASSET,
        from: lockAndMintParams.from,
        to: lockAndMintParams.to,
      });
      setLockFee(fees.lock ? fees.lock.toNumber() : 0);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLockFee]);

  if (!isOpen(mint.session)) {
    return <LoaderBlock />;
  }

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
              <strong>{`${(lockfee / 10 ** 8) * 2} ${SOURCE_ASSET}`}</strong>.
            </GatewayInfoItem>
            <GatewayInfoItem>
              <HMSCountdown milliseconds={timeRemained} /> is the remaining time to safely send the
              assets.
            </GatewayInfoItem>
          </GatewayInfoItems>
        </GatewayInfoWrapper>
      </Description>
      <AddressQRCodePanel address={mint.session?.gatewayAddress} />
      <Description>
        {mint.deposits.map((depositId) => (
          <DepositStatus key={depositId} session={mint} depositId={depositId} />
        ))}
      </Description>
    </>
  );
};
