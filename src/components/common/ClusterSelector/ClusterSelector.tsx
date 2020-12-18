import React, { FunctionComponent } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';

import { Cluster } from '@solana/web3.js';

import { CLUSTERS } from 'config/constants';
import { RootState } from 'store/rootReducer';
import { disconnect, selectCluster } from 'store/slices/wallet/WalletSlice';

export const ClusterSelector: FunctionComponent = () => {
  const dispatch = useDispatch();
  const cluster = useSelector((state: RootState) => state.wallet.cluster);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCluster = e.target.value as Cluster;

    batch(() => {
      dispatch(selectCluster(newCluster));
      dispatch(disconnect());
    });
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
