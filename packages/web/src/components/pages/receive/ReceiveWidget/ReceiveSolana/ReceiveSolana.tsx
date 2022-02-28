import type { FC } from 'react';

import { useWallet } from '@p2p-wallet-web/core';

import { useUsername } from 'app/contexts';
import { UsernameAddressWidget } from 'components/common/UsernameAddressWidget';
import { trackEvent } from 'utils/analytics';
import { getExplorerUrl } from 'utils/connection';

import { BottomWrapper, Content, ExplorerA, ShareIcon } from '../common/styled';

export const ReceiveSolana: FC = () => {
  const { network, publicKey } = useWallet();
  const { username, domain } = useUsername();

  if (!publicKey) {
    return null;
  }

  const handleExplorerClick = () => {
    trackEvent('Receive_Viewing_Explorer', { Receive_Network: 'solana' });
  };

  return (
    <>
      <Content className="noTopPadding">
        <UsernameAddressWidget
          type="receive"
          address={publicKey?.toBase58() || ''}
          username={username ? `${username}${domain}` : ''}
        />
      </Content>
      <BottomWrapper>
        <ExplorerA
          href={getExplorerUrl('address', publicKey.toBase58(), network)}
          target="_blank"
          rel="noopener noreferrer noindex"
          onClick={handleExplorerClick}
          className="button"
        >
          <ShareIcon name="external" />
          View in Solana explorer
        </ExplorerA>
      </BottomWrapper>
    </>
  );
};
