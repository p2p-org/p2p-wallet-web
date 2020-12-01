import React, { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Cluster } from '@solana/web3.js';

import { CLUSTERS } from 'config/constants';
import { disconnect, selectCluster } from 'features/wallet/WalletSlice';
import { RootState } from 'store/rootReducer';

export const ClusterSelector: FunctionComponent = () => {
  const dispatch = useDispatch();
  const cluster = useSelector((state: RootState) => state.wallet.cluster);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCluster = e.target.value as Cluster;

    dispatch(disconnect());
    dispatch(selectCluster(newCluster));
  };

  return (
    <select value={cluster} onChange={handleChange}>
      {CLUSTERS.map((itemCluster) => (
        <option key={itemCluster} value={itemCluster}>
          {itemCluster}
        </option>
      ))}
    </select>
  );
};
