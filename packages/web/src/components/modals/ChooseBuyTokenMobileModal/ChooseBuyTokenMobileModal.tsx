import type { FC } from 'react';
import { useHistory, useLocation } from 'react-router';

import type { TokenAccount } from '@p2p-wallet-web/core';
import {
  useToken,
  useUserAssociatedTokenAccountsWithNativeSOLOverride,
} from '@p2p-wallet-web/core';

import type { ModalPropsType } from 'app/contexts';
import { useConfig } from 'app/contexts';
import { Modal } from 'components/ui/Modal';

import { ActionRow } from './ActionRow';

export const ChooseBuyTokenMobileModal: FC<ModalPropsType> = ({ close }) => {
  const history = useHistory();
  const location = useLocation();
  const { tokenConfigs } = useConfig();
  const tokenSOL = useToken(tokenConfigs['SOL']?.mint);
  const tokenUSDC = useToken(tokenConfigs['USDC']?.mint);
  //tokenSOL?.info.extensions?.coingeckoId;

  const tokenAccountList = useUserAssociatedTokenAccountsWithNativeSOLOverride([
    tokenSOL,
    tokenUSDC,
  ]);

  const handleCloseClick = () => {
    close(false);
  };

  const handleRowClick = (tokenAccount?: TokenAccount) => {
    handleCloseClick();

    const symbol = tokenAccount?.balance?.token.symbol || 'SOL';
    const newPath = `/buy/${symbol}`;

    if (location.pathname !== newPath) {
      history.push(newPath);
    }
  };

  return (
    <Modal noDelimiter={false} close={handleCloseClick} title="Choose a crypto for buying">
      {tokenAccountList.map((tokenAccount) => (
        <ActionRow
          key={tokenAccount?.key?.toBase58()}
          tokenAccount={tokenAccount}
          onClick={() => handleRowClick(tokenAccount)}
        />
      ))}
    </Modal>
  );
};
