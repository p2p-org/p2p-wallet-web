import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import { useSolana } from '@p2p-wallet-web/core';
import { useNativeAccount } from '@p2p-wallet-web/sail';
import { theme, useIsMobile } from '@p2p-wallet-web/ui';
import { Bitcoin } from '@renproject/chains-bitcoin';
import { Solana } from '@renproject/chains-solana';
import type { PublicKey } from '@solana/web3.js';

import type { ReceiveSourceNetworkType } from 'app/contexts';
import {
  ModalType,
  RECEIVE_SOURCE_NETWORKS,
  useModals,
  useNetworkFees,
  useReceiveState,
} from 'app/contexts';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Select, SelectItem } from 'components/ui';
import { trackEvent } from 'utils/analytics';
import { getAvatarSize } from 'utils/common';
import { useRenNetwork } from 'utils/hooks/renBridge/useNetwork';

const InfoWrapper = styled.div`
  margin-left: 12px;
`;

const Line = styled.div`
  line-height: 17px;
`;

const Text = styled.div`
  display: inline-block;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.01em;

  &.bottom {
    color: ${theme.colors.textIcon.primary};
    font-size: 16px;
  }

  &::first-letter {
    text-transform: uppercase;
  }
`;

const Network = styled.div`
  margin-left: 12px;

  &::first-letter {
    text-transform: uppercase;
  }
`;

const SYMBOLS = {
  bitcoin: 'renBTC',
  solana: 'SOL',
};

export const NetworkSelect: FC = () => {
  const isMobile = useIsMobile();
  const { openModal } = useModals();
  const solanaProvider = useSolana();
  const renNetwork = useRenNetwork();
  const { nativeBalance } = useNativeAccount();
  const { accountRentExemption } = useNetworkFees();

  const { sourceNetwork, setSourceNetwork } = useReceiveState();
  const [isBTCTokenLoading, setIsBTCTokenLoading] = useState(false);
  const [hasBTCTokenAccount, setBTCTokenAccount] = useState<PublicKey | false>();

  useEffect(() => {
    const mount = async () => {
      setIsBTCTokenLoading(true);
      try {
        setBTCTokenAccount(
          await new Solana(solanaProvider, renNetwork).getAssociatedTokenAccount(Bitcoin.asset),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsBTCTokenLoading(false);
      }
    };

    void mount();
  }, [renNetwork, solanaProvider]);

  const handleSourceNetworkClick = useCallback(
    (source: ReceiveSourceNetworkType) => async () => {
      if (source === 'bitcoin' && !hasBTCTokenAccount) {
        const result = await openModal<boolean>(ModalType.SHOW_MODAL_RECEIVE_BITCOIN, {
          nativeBalance,
          accountRentExemption,
        });

        if (!result) {
          return false;
        }
      }

      setSourceNetwork(source);
      trackEvent('Receive_Network_Changed', { Receive_Network: source });
    },
    [hasBTCTokenAccount, openModal, setSourceNetwork, nativeBalance, accountRentExemption],
  );

  const handleToggleClick = (isOpen: boolean) => {
    if (isOpen) {
      trackEvent('Receive_Changing_Network');
    }
  };

  const title = 'Showing my address for';
  const avatarSize = getAvatarSize(isMobile);

  return (
    <Select
      isLoading={isBTCTokenLoading}
      onToggle={handleToggleClick}
      mobileListTitle={title}
      value={
        <>
          <TokenAvatar symbol={SYMBOLS[sourceNetwork]} size={44} />
          <InfoWrapper>
            <Line>
              <Text>{title}</Text>
            </Line>
            <Line>
              <Text className="bottom">{sourceNetwork} network</Text>
            </Line>
          </InfoWrapper>
        </>
      }
    >
      {RECEIVE_SOURCE_NETWORKS.map((network) => (
        <SelectItem
          key={network}
          isSelected={network === sourceNetwork}
          onItemClick={handleSourceNetworkClick(network)}
        >
          <TokenAvatar symbol={SYMBOLS[network]} size={avatarSize} />
          <Network>{network} network</Network>
        </SelectItem>
      ))}
    </Select>
  );
};
