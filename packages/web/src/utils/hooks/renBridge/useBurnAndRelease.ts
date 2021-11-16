import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LockChain, MintChain, RenNetwork } from '@renproject/interfaces';
import type RenJS from '@renproject/ren';
import type {
  BurnMachineContext,
  BurnStates,
  LockChainMap,
  MintChainMap,
} from '@renproject/ren-tx';
import { buildBurnContextWithMap, burnMachine } from '@renproject/ren-tx';
import type { BurnSession } from '@renproject/ren-tx/build/main/types/burn';
import { isBurnCompleted } from '@renproject/ren-tx/build/main/types/burn';
import { useMachine } from '@xstate/react';
import BigNumber from 'bignumber.js/bignumber';

interface BurnParams {
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
  destinationAddress: string;
  /**
   * How much the user wishes to burn in the minimum denomination (eg SATS for BTC)
   */
  targetAmount: string;

  /**
   * Optional random 32 bytes to make the gateway address unique. Must be persisted in order to restore the transaction
   */
  nonce?: string | Buffer;
}

function sessionFromBurnConfigMultiple<X, Y, CustomParams = {}>(config: {
  burnParams: BurnParams;
  userAddress: string;
  destinationChain: string;
  sourceChain: string;
  customParams: CustomParams;
}): BurnSession<X, Y> {
  const session: BurnSession<X, Y> = {
    ...config.burnParams,
    id: '',
    userAddress: config.userAddress,
    destAddress: config.burnParams.destinationAddress,
    destChain: config.destinationChain,
    sourceChain: config.sourceChain,
    targetAmount: config.burnParams.targetAmount,
    customParams: config.customParams,
    createdAt: Date.now(),
  };
  session.id = 'tx-' + Math.floor(Math.random() * 10 ** 16);
  return session;
}

export interface BurnConfig {
  sdk: RenJS;
  burnParams: BurnParams;
  debug?: boolean;
  autoSubmit?: boolean;
}

// Use this if you want to handle persistence yourself
export interface BurnConfigSingle extends BurnConfig {
  to: LockChain;
  from: MintChain;
  /**
   * Address that can cryptographically be proven to belong to a user. Used as a "from" address for some chains
   */
  userAddress: string;
}

// Use this if you want to set up & restore multiple assets / destinations
export interface BurnConfigMultiple<CustomParams = {}> extends BurnConfig {
  toMap: LockChainMap<BurnMachineContext<any, any>>;
  fromMap: MintChainMap<BurnMachineContext<any, any>>;
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

function isSingleBurn(c: BurnConfigSingle | BurnConfigMultiple): c is BurnConfigSingle {
  return (c as BurnConfigSingle).to !== undefined;
}

const buildBurnContext = <X, Y>(
  config: BurnConfigSingle | BurnConfigMultiple,
): BurnMachineContext<X, Y> => {
  const { sdk } = config;
  let tx: BurnSession<X, Y>;

  let fromChainMap: MintChainMap<BurnMachineContext<X, Y>> = {};
  let toChainMap: LockChainMap<BurnMachineContext<X, Y>> = {};
  if (isSingleBurn(config)) {
    fromChainMap = { [config.from.name]: (_: any) => config.from };
    toChainMap = { [config.to.name]: (_: any) => config.to };
    tx = sessionFromBurnConfigMultiple({
      ...config,
      sourceChain: config.from.name,
      userAddress: config.userAddress,
      destinationChain: config.to.name,
      customParams: {},
    });
  } else {
    tx = sessionFromBurnConfigMultiple(config);
    fromChainMap = config.fromMap;
    toChainMap = config.toMap;
  }
  return buildBurnContextWithMap({
    tx,
    sdk,
    fromChainMap,
    toChainMap,
  });
};

export const useBurnAndRelease = (config: BurnConfigSingle | BurnConfigMultiple) => {
  const context = useMemo(() => buildBurnContext(config), [config]);
  context.autoSubmit = config.autoSubmit;

  const [state, , machine] = useMachine(burnMachine, {
    context,
    devTools: true,
  });
  const burn = useCallback(() => {
    machine.send({ type: 'SUBMIT' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machine.send]);

  const [decimals, setDecimals] = useState(0);
  const [burnExplorerLink, setBurnExplorerLink] = useState<string>();
  const [releaseExplorerLink, setReleaseExplorerLink] = useState<string>();

  useEffect(() => {
    void (async () => {
      const fromChain = state.context.from(state.context);

      const toChain = state.context.to(state.context);

      const currentTx = state.context.tx.transaction;

      if (currentTx) {
        setBurnExplorerLink(
          fromChain.utils?.transactionExplorerLink &&
            fromChain.utils.transactionExplorerLink(
              currentTx.sourceTxHash || (currentTx as any).rawSourceTx,
              state.context.tx.network,
            ),
        );
      }

      if (currentTx && isBurnCompleted(currentTx)) {
        setReleaseExplorerLink(
          toChain.utils?.transactionExplorerLink &&
            toChain.utils.transactionExplorerLink(currentTx.destTxHash, state.context.tx.network),
        );
      }

      const assetDecimals = await toChain.assetDecimals(state.context.tx.sourceAsset);
      setDecimals(assetDecimals);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDecimals, context]);

  const formatAmount = useCallback(
    (amount: string) => {
      return new BigNumber(amount).div(10 ** decimals).toNumber();
    },
    [decimals],
  );

  return {
    machine,
    state,
    formatAmount,
    burnExplorerLink,
    releaseExplorerLink,
    value: state.value as BurnStates,
    session: state.context.tx,
    tx: state.context.tx.transaction,
    burn,
  };
};
