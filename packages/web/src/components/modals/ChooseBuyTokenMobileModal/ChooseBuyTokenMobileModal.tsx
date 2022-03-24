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
  const tokenList = useMemo(
    () =>
      tokenAccounts
        .filter((token) => ['SOL', 'USDC'].includes(token.balance?.token.symbol ?? ''))
        .sort(),
    [tokenAccounts],
  );

  const handleCloseClick = () => {
    close(false);
  };

  const handleRowClick = (token: TokenAccount) => {
    handleCloseClick();

    const symbol = token.balance?.token.symbol || 'SOL';
    const newPath = `/buy/${symbol}`;

    if (location.pathname !== newPath) history.push(newPath);
  };

  return (
    <Modal noDelimiter={false} close={handleCloseClick} title="Choose a crypto for buying">
      {tokenList.map((token) => (
        <ActionRow
          key={token.key?.toBase58()}
          tokenAccount={token}
          onClick={() => handleRowClick(token)}
        />
      ))}
    </Modal>
  );
};

//TODO: - убрать выбор валюты из мобильной версии покупки
//TODO: - сделать строки
//TODO: - сделать массив валют для строк
//TODO: - спросить про стиль шрифта - он не один для всех, его делать нужно для каждой шторки?
