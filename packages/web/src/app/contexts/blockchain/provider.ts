import { useState } from 'react';

import { createContainer } from 'unstated-next';

export type SetSlot = (slot: number) => void;

export interface UseBlockchain {
  slot: number;
  setSlot: SetSlot;
}

const useBlockchainInternal = (): UseBlockchain => {
  const [slot, setSlot] = useState<number>(0);

  return {
    slot,
    setSlot,
  };
};

export const { Provider: BlockchainProvider, useContainer: useBlockchain } =
  createContainer(useBlockchainInternal);
