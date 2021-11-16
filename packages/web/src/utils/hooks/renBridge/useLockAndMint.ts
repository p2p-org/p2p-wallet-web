/* eslint-disable @typescript-eslint/no-explicit-any, no-unused-vars, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars,react-hooks/rules-of-hooks,react-hooks/exhaustive-deps */

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { UTXO } from '@renproject/chains-bitcoin/build/main/APIs/API';
import type { DepositCommon, LockChain, MintChain, RenNetwork } from '@renproject/interfaces';
import type RenJS from '@renproject/ren';
import type {
  AcceptedGatewayTransaction,
  DepositStates,
  GatewayMachineContext,
  GatewaySession,
  GatewayStates,
  LockChainMap,
  MintChainMap,
} from '@renproject/ren-tx';
import { buildMintContextWithMap, isAccepted, isMinted, mintMachine } from '@renproject/ren-tx';
import type { BurnSession } from '@renproject/ren-tx/build/main/types/burn';
import { useActor, useMachine, useSelector } from '@xstate/react';
import BigNumber from 'bignumber.js/bignumber';

interface MintParams {
  /**
   * Asset to be minted/burned (on native chain) eg. "BTC"
   */
  sourceAsset: string;
  /**
   * Ren network version to be used, which determines network versions for the selected chains
   */
  network: RenNetwork | 'testnet' | 'mainnet';
  /**
   * Address that will recieve the asset, eg. "0xA1..."
   */
  destAddress: string;
  /**
   * How much the user expects to recieve in destAsset (eg. BTC)
   *
   */
  targetAmount?: string | number;

  /**
   * Amount of sourceAsset user is suggested to send in the base denomination (eg. SATs for Bitcoin)
   * Usually the targetAmount + fees
   */
  suggestedAmount?: string | number;

  /**
   * Optional random 32 bytes to make the gateway address unique. Must be persisted in order to restore the transaction
   */
  nonce?: string | Buffer;
}

export type DepositTranstaction = AcceptedGatewayTransaction<any>;

// Amount of time remaining until gateway expires
// We remove 1 day from the ren-tx expiry to reflect the extra mint
// submission leeway
// FIXME: once ren-tx takes the two stages into account, fix this
export const getRemainingGatewayTime = (expiryTime: number) =>
  Math.ceil(expiryTime - 24 * 60 * 60 * 1000 - Number(new Date()));

export const getSessionDay = () => Math.floor(Date.now() / 1000 / 60 / 60 / 24);

// user has 72 hours from the start of a session day to complete the tx
// a gateway is only valid for 48 hours however.
//
// FIXME: once ren-tx takes the two-stage expiry into account, update this
export const getSessionExpiry = () => (getSessionDay() + 3) * 60 * 60 * 24 * 1000;

export function idFromParams(session: GatewaySession<any> | BurnSession<any, any>): string {
  return `tx-${session.userAddress}-${getSessionDay()}-${session.sourceAsset}-to-${
    session.destChain
  }`;
}

export function formatAmount(amount: string) {
  return new BigNumber(amount).div(10 ** 8).toNumber();
}

function sessionFromMintConfigMultiple<X, CustomParams = {}>(config: {
  mintParams: MintParams;
  userAddress: string;
  destinationChain: string;
  sourceChain: string;
  customParams: CustomParams;
}): GatewaySession<X> {
  const session: GatewaySession<X> = {
    ...config.mintParams,
    id: '',
    userAddress: config.userAddress,
    destAddress: config.mintParams.destAddress,
    destChain: config.destinationChain,
    sourceChain: config.sourceChain,
    expiryTime: getSessionExpiry(),
    transactions: {},
    customParams: config.customParams,
    createdAt: Date.now(),
  };
  session.id = idFromParams(session);
  return session;
}

export interface MintConfig {
  sdk: RenJS;
  mintParams: MintParams;
  debug?: boolean;
}

// Use this if you want to send to a single destination
export interface MintConfigSingle extends MintConfig {
  to: MintChain;
  from: LockChain;
}

// Use this if you want to set up & restore multiple assets / destinations
export interface MintConfigMultiple<CustomParams = {}> extends MintConfig {
  toMap: MintChainMap<GatewayMachineContext<any>>;
  fromMap: LockChainMap<GatewayMachineContext<any>>;
  /**
   * Chain that the source asset is located on, eg. "Bitcoin"
   */
  sourceChain: string;
  /**
   * Chain that the asset will be recieved on eg. "Ethereum"
   */
  destinationChain: string;
  /**
   * Address that can cryptographically be proven to belong to a user. Used as a "from" address for some chains
   */
  userAddress: string;
  /**
   * Extra parameters to be used for constructing to/from contract parameters
   */
  customParams: CustomParams;
}

function isSingle(c: MintConfigSingle | MintConfigMultiple): c is MintConfigSingle {
  return (c as MintConfigSingle).to !== undefined;
}

const buildMintContext = <X>(config: MintConfigSingle | MintConfigMultiple) => {
  const { sdk } = config;
  let tx: GatewaySession<X>;

  let fromChainMap = {};
  let toChainMap = {};
  if (isSingle(config)) {
    fromChainMap = { [config.from.name]: (_: any) => config.from };
    toChainMap = { [config.to.name]: (_: any) => config.to };
    tx = sessionFromMintConfigMultiple({
      ...config,
      sourceChain: config.from.name,
      userAddress: '',
      destinationChain: config.to.name,
      customParams: {},
    });
  } else {
    tx = sessionFromMintConfigMultiple(config);
    fromChainMap = config.fromMap;
    toChainMap = config.toMap;
  }
  return buildMintContextWithMap<X>({
    tx,
    sdk,
    fromChainMap,
    toChainMap,
  });
};

export const useLockAndMint = (config: MintConfigSingle | MintConfigMultiple) => {
  const context = useMemo(() => buildMintContext(config), [config]);

  const [state, , machine] = useMachine(mintMachine, {
    context,
    devTools: config.debug,
  });

  const session = useSelector(machine, (x) => {
    return x.context.tx;
  });

  const addDeposit = useCallback(
    (amount, txHash, vOut) => {
      const rawSourceTx: DepositCommon<UTXO> = {
        amount: String(amount),
        transaction: {
          amount: String(amount),
          txHash,
          vOut,
          confirmations: 100,
        },
      };
      machine.send({
        type: 'RESTORE',
        data: { sourceTxHash: txHash, rawSourceTx },
      });
    },
    [machine.send],
  );

  const [decimals, setDecimals] = useState(0);

  useEffect(() => {
    void (async () => {
      const assetDecimals = await context.from(context).assetDecimals(context.tx.sourceAsset);
      setDecimals(assetDecimals);
    })();
  }, [setDecimals, context]);

  const formatAmount = useCallback(
    (amount: string) => {
      return new BigNumber(amount).div(10 ** decimals).toNumber();
    },
    [decimals],
  );

  return {
    addDeposit,
    deposits: Object.keys(state.context.depositMachines || {}),
    formatAmount,
    session,
    sessionMachine: machine,
    state: state.value as GatewayStates,
    currentState: state,
  };
};

export const useDeposit = (session: ReturnType<typeof useLockAndMint>, depositId: string) => {
  const depositMachine = useSelector(session.sessionMachine, (context) => {
    if (!context.context.depositMachines) return;
    return context.context.depositMachines[depositId];
  });
  if (!depositMachine) return;
  const [state, send] = useActor(depositMachine);

  const mint = useCallback(() => {
    if (!isAccepted(state.context.deposit)) return;
    send({ type: 'CLAIM', data: state.context.deposit, params: {} });
  }, [state.context.deposit, send]);

  const [decimals, setDecimals] = useState(0);
  const [depositExplorerLink, setDepositExplorerLink] = useState<string>();
  const [mintExplorerLink, setMintExplorerLink] = useState<string>();

  useEffect(() => {
    void (async () => {
      const fromChain = session.sessionMachine.state.context.from(
        session.sessionMachine.state.context,
      );

      const toChain = session.sessionMachine.state.context.to(session.sessionMachine.state.context);

      const currentTx = session.sessionMachine.state.context.tx.transactions[depositId];

      if (isMinted(currentTx)) {
        setMintExplorerLink(
          toChain.utils?.transactionExplorerLink &&
            toChain.utils.transactionExplorerLink(currentTx.destTxHash),
        );
      }

      const assetDecimals = await fromChain.assetDecimals(
        session.sessionMachine.state.context.tx.sourceAsset,
      );
      setDecimals(assetDecimals);
      setDepositExplorerLink(
        fromChain.utils?.transactionExplorerLink &&
          fromChain.utils?.transactionExplorerLink(currentTx.rawSourceTx.transaction),
      );
    })();
  }, [
    setDecimals,
    session.sessionMachine.state.context.from,
    state.context.deposit.rawSourceTx,
    (state.context.deposit as any).rawDestTx,
  ]);

  const formatAmount = useCallback(
    (amount: string) => {
      return new BigNumber(amount).div(10 ** decimals).toNumber();
    },
    [decimals],
  );

  return {
    state,
    formatAmount,
    depositExplorerLink,
    mintExplorerLink,
    value: state.value as DepositStates,
    deposit: state.context.deposit,
    mint,
  };
};
