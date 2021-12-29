import type { FC } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useConnectedWallet, useSolana } from '@p2p-wallet-web/core';
import { Bitcoin } from '@renproject/chains-bitcoin';
import type { SolanaProvider } from '@renproject/chains-solana';
import { Solana } from '@renproject/chains-solana';
import type { RenNetwork } from '@renproject/interfaces';
import { getRenNetworkDetails } from '@renproject/interfaces';
import RenJS from '@renproject/ren';
import type { GatewaySession, GatewayTransaction, OpenedGatewaySession } from '@renproject/ren-tx';
import { DepositStates, isAccepted } from '@renproject/ren-tx';
import { isNil } from 'ramda';

import { NotifyToast } from 'components/common/NotifyToast';
import { ToastManager } from 'components/common/ToastManager';
import { Button } from 'components/ui';
import type { DepositTranstaction } from 'utils/hooks/renBridge/useLockAndMint';
import { formatAmount, useLockAndMint } from 'utils/hooks/renBridge/useLockAndMint';
import { useRenNetwork } from 'utils/hooks/renBridge/useNetwork';
import type { MintConfig } from 'utils/lockAndMintConfig';
import { initConfig, loadAndDeleteExpired } from 'utils/lockAndMintConfig';

export type DepositState = {
  currentState: DepositStates;
  mint: () => void;
  deposit: DepositTranstaction;
};

type Deposits = {
  [key: string]: DepositState;
};

type LockAndMintContext = {
  isConfigInitialized: boolean;
  initializeConfig: () => void;
  gatewayAddress: string;
  expiryTime: number;
  deposits: Deposits;
};

const Context = createContext<null | LockAndMintContext>(null);

type RenJSCache = Record<RenNetwork, RenJS>;

const renJsCache: Partial<RenJSCache> = {};
const getRenjs = (network: RenNetwork) => {
  if (!renJsCache[network]) {
    renJsCache[network] = new RenJS(network);
  }
  return renJsCache[network] as RenJS;
};

const chainsCache: any = {};
const getChains = (network: RenNetwork, solanaProvider: SolanaProvider) => {
  const { bitcoin, solana } = chainsCache;
  if (!bitcoin && !solana) {
    chainsCache.bitcoin = new Bitcoin();
    chainsCache.solana = new Solana(solanaProvider, network);
  }
  return chainsCache;
};

const showDepositToast = (sourceTxConfs: number, sourceTxConfTarget: number) => {
  const isCompleted = sourceTxConfs !== sourceTxConfTarget;
  const header = isCompleted
    ? 'Waiting for deposit confirmation...'
    : 'The deposit has been confirmed!';
  const status = isCompleted ? 'confirmingDeposit' : 'confirmedDeposit';
  ToastManager.show(({ onClose }) => (
    <NotifyToast
      type="confirmingDeposit"
      onClose={onClose}
      header={header}
      status={status}
      text={`${sourceTxConfs} / ${sourceTxConfTarget}`}
    />
  ));
};

const DepositWatcher: FC<{
  deposit: DepositTranstaction;
  machine: any;
  targetConfirmationsCount: number;
  onDepositChage: (depositId: string, deposit: DepositState) => void;
}> = ({ deposit, machine, targetConfirmationsCount, onDepositChage }) => {
  const rawAmount = useMemo(() => {
    return formatAmount(deposit.rawSourceTx.amount);
  }, [deposit.rawSourceTx.amount]);

  const { send, depositId } = useMemo(() => {
    return {
      depositId: machine.id,
      send: machine.send,
    };
  }, [machine.id, machine.send]);

  const mint = useCallback(() => {
    if (!isAccepted(deposit)) return;
    send({ type: 'CLAIM', data: deposit, params: {} });
  }, [deposit, send]);

  const { value } = machine.state;

  useEffect(() => {
    onDepositChage(depositId, { currentState: value, mint, deposit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositId, mint, value, deposit]);

  useEffect(() => {
    if (
      value === DepositStates.RENVM_ACCEPTED &&
      window.location.pathname !== '/receive' &&
      deposit.renSignature
    ) {
      ToastManager.show(({ onClose }) => (
        <NotifyToast
          type="mint"
          onClose={onClose}
          header={'Awaiting the signature on your wallet'}
          status="warning"
          button={
            <Button
              primary
              onClick={() => {
                mint();
                if (onClose) {
                  onClose();
                }
              }}
            >{`Mint ${rawAmount} BTC`}</Button>
          }
        />
      ));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deposit.renSignature, value]);

  useEffect(() => {
    if (value === DepositStates.CONFIRMING_DEPOSIT) {
      showDepositToast(deposit.sourceTxConfs || 0, targetConfirmationsCount);
    }
  }, [deposit.sourceTxConfs, targetConfirmationsCount, value]);

  return null;
};

const getActiveDepositId = (tx: GatewaySession<any>) => {
  if (isNil(tx.transactions)) return undefined;
  const transactions = Object.values(tx.transactions);
  const activeTransactions = transactions
    .filter((t: any) => !t?.completedAt)
    .sort(
      (a: GatewayTransaction<any>, b: GatewayTransaction<any>) =>
        Number(a.detectedAt || 0) - Number(b.detectedAt || 0),
    );
  return activeTransactions.length > 0 ? activeTransactions[0].sourceTxHash : undefined;
};

const LockAndMintSession: FC<{
  nonce: string;
  onGatewayAddressInit: (address: string) => void;
  onDepositChage: (depositId: string, deposit: DepositState) => void;
}> = ({ nonce, onGatewayAddressInit, onDepositChage }) => {
  const solanaProvider = useSolana();
  const network = useRenNetwork();
  const { bitcoin, solana } = getChains(network, solanaProvider);
  const lockAndMintParams = useMemo(() => {
    return {
      sdk: getRenjs(network),
      mintParams: {
        sourceAsset: Bitcoin.asset,
        network,
        destAddress: solanaProvider.publicKey!.toBase58(),
        nonce: nonce,
      },
      from: bitcoin,
      to: solana,
    };
  }, [bitcoin, network, nonce, solana]);

  const mint = useLockAndMint(lockAndMintParams);

  useEffect(() => {
    onGatewayAddressInit((mint.session as OpenedGatewaySession<any>).gatewayAddress);
  }, [mint.session, onGatewayAddressInit]);

  const targetConfirmationsCount = useMemo(() => {
    return getRenNetworkDetails(network).isTestnet ? 1 : 6;
  }, [network]);

  const current = mint.currentState;
  const activeDepositId = getActiveDepositId(current.context.tx);

  const activeDeposit = useMemo(() => {
    if (!current.context.tx.transactions || activeDepositId === undefined) {
      return null;
    }
    const deposit = current.context.tx.transactions[activeDepositId];
    if (!deposit || !current.context.depositMachines) return null;
    const machine = current.context.depositMachines[deposit.sourceTxHash];
    return { deposit, machine } as any;
  }, [activeDepositId, current.context]);

  if (activeDeposit) {
    return (
      <DepositWatcher
        deposit={activeDeposit.deposit}
        machine={activeDeposit.machine}
        targetConfirmationsCount={targetConfirmationsCount}
        onDepositChage={onDepositChage}
      />
    );
  }

  return null;
};

export const LockAndMintProvider: FC = ({ children }) => {
  const wallet = useConnectedWallet();
  const [config, setConfig] = useState<MintConfig | null>(null);
  const [gatewayAddress, setGatewayAddress] = useState<string>('');
  const [deposits, setDeposits] = useState<Deposits>({});
  const publicKey = wallet?.publicKey;

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    setConfig(loadAndDeleteExpired(publicKey.toBase58()));
  }, [publicKey]);

  const initializeConfig = useCallback(() => {
    if (!publicKey) {
      return;
    }
    setTimeout(() => {
      setConfig(initConfig(publicKey.toBase58()));
    }, 0);
  }, [publicKey]);

  const handleGatewayAddressInit = useCallback((address: string) => {
    if (address) {
      setGatewayAddress(address);
    }
  }, []);

  const handleDepositsChange = (depositId: string, deposit: DepositState) => {
    setDeposits({
      ...deposits,
      [depositId]: deposit,
    });
  };

  useEffect(() => {
    for (const depositId of Object.keys(deposits)) {
      if (deposits[depositId].currentState === DepositStates.COMPLETED) {
        const newDeposits = { ...deposits };
        delete newDeposits[depositId];
        setTimeout(() => {
          setDeposits({
            ...newDeposits,
          });
        }, 3000);
      }
    }
  }, [deposits]);

  const expiryTime = config ? config.expiryTime : 0;

  const content = useMemo(() => children, [children]);
  return (
    <>
      {publicKey && config ? (
        <LockAndMintSession
          nonce={config.nonce}
          onGatewayAddressInit={handleGatewayAddressInit}
          onDepositChage={handleDepositsChange}
        />
      ) : undefined}
      <Context.Provider
        value={{
          isConfigInitialized: !!config,
          initializeConfig,
          gatewayAddress,
          expiryTime,
          deposits,
        }}
      >
        {content}
      </Context.Provider>
    </>
  );
};

export const useLockAndMintProvider = (): LockAndMintContext => {
  const ctx = useContext(Context);
  if (ctx === null) {
    throw new Error('Context not available');
  }
  return ctx;
};

type Fees = {
  mint: number;
  burn: number;
  lock: number;
  release: number;
};

type FeesCache = {
  timestamp: number;
  fees: Fees;
};

const feesCache: FeesCache = {
  timestamp: 0,
  fees: {
    mint: 0,
    burn: 0,
    lock: 0,
    release: 0,
  },
};

export const useFetchFees = (isNeedLoadFee = true) => {
  const solanaProvider = useSolana();
  const network = useRenNetwork();
  const { bitcoin, solana } = getChains(network, solanaProvider);

  const [fees, setFees] = useState(feesCache.fees);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const fetchFees = async () => {
      setPending(true);
      const rates = await getRenjs(network).getFees({
        asset: Bitcoin.asset,
        from: bitcoin,
        to: solana,
      });
      setPending(false);

      const fees = {
        mint: rates.mint,
        burn: rates.burn,
        lock: rates.lock ? rates.lock.toNumber() : 0,
        release: rates.release ? rates.release.toNumber() : 0,
      };
      setFees(fees);

      feesCache.fees = fees;
      feesCache.timestamp = Date.now();
    };

    if (
      isNeedLoadFee &&
      (!feesCache.timestamp || feesCache.timestamp + 1000 * 60 * 5 <= Date.now())
    ) {
      void fetchFees();
    } else {
      setFees(feesCache.fees);
    }
  }, [bitcoin, isNeedLoadFee, network, solana]);

  return { fees, pending };
};
