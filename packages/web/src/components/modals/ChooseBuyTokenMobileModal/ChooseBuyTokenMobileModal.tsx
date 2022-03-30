import type { FC } from 'react';
import { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router';

import type { TokenAccount } from '@p2p-wallet-web/core';
import { useTokenAccounts, useTokenAccountsContext } from '@p2p-wallet-web/core';

import type { ModalPropsType } from 'app/contexts';
import { Modal } from 'components/ui/Modal';

import { ActionRow } from './ActionRow';

interface Props {}

export const ChooseBuyTokenMobileModal: FC<Props & ModalPropsType> = ({ close }) => {
  const history = useHistory();
  const location = useLocation();
  const { userTokenAccountKeys } = useTokenAccountsContext();
  const tokenAccounts = useTokenAccounts(userTokenAccountKeys);
  const tokenAccountList = useMemo(
    () =>
      tokenAccounts
        .filter((token) => ['SOL', 'USDC'].includes(token?.balance?.token.symbol ?? ''))
        .sort((a, b) => {
          const aSymbol = a?.balance?.token.symbol || '';
          const bSymbol = b?.balance?.token.symbol || '';
          if (aSymbol < bSymbol) {
            return -1;
          }
          if (aSymbol > bSymbol) {
            return 1;
          }
          return 0;
        }),
    [tokenAccounts],
  );

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
