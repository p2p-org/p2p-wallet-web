import type { FC } from 'react';

import type { Wallet } from 'new/sdk/SolanaSDK';

import { BaseWalletCell } from '../../common/BaseWalletCell';

interface Props {
  wallet?: Wallet;
  isPlaceholder?: boolean;
  onHideClick?: () => void;
}

export const VisibleWalletCell: FC<Props> = ({ wallet, isPlaceholder, onHideClick }) => {
  return (
    <BaseWalletCell wallet={wallet} isPlaceholder={isPlaceholder} onToggleClick={onHideClick} />
  );
};
