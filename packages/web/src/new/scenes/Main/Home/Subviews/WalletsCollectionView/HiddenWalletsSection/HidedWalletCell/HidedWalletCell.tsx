import type { FC } from 'react';

import type { Wallet } from 'new/app/sdk/SolanaSDK';

import { BaseWalletCell } from '../../common/BaseWalletCell';

interface Props {
  wallet?: Wallet;
  isPlaceholder?: boolean;
  onShowClick?: () => void;
}

export const HidedWalletCell: FC<Props> = ({ wallet, isPlaceholder, onShowClick }) => {
  return (
    <BaseWalletCell
      wallet={wallet}
      isPlaceholder={isPlaceholder}
      isHidden
      onToggleClick={onShowClick}
    />
  );
};
