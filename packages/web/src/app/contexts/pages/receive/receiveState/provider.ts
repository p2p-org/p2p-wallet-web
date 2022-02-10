import { useState } from 'react';

import { createContainer } from 'unstated-next';

import type { ReceiveSourceNetworkType } from './types';

export const RECEIVE_SOURCE_NETWORKS = ['solana', 'bitcoin'] as const;

export interface UseReceiveState {
  sourceNetwork: ReceiveSourceNetworkType;
  setSourceNetwork: (v: ReceiveSourceNetworkType) => void;
}

const useReceiveStateInternal = (): UseReceiveState => {
  const [sourceNetwork, setSourceNetwork] = useState<ReceiveSourceNetworkType>(
    RECEIVE_SOURCE_NETWORKS[0]!,
  );

  return {
    sourceNetwork,
    setSourceNetwork,
  };
};

export const { Provider: ReceiveStateProvider, useContainer: useReceiveState } =
  createContainer(useReceiveStateInternal);
