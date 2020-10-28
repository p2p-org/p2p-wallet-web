import React, { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { NETWORKS } from 'config/constants';
import { changeEntrypointAndConnect } from 'store/actions/complex/blockchain';
import { RootState } from 'store/types';

export const NetworkSelect: FunctionComponent = () => {
  const entrypoint = useSelector((state: RootState) => state.data.blockchain.entrypoint);
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    dispatch(changeEntrypointAndConnect(e.target.value));

  return (
    <select value={entrypoint} onChange={handleChange}>
      {NETWORKS.map((url) => (
        <option key={url} value={url}>
          {url}
        </option>
      ))}
    </select>
  );
};
