import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import type { Network } from '@saberhq/solana-contrib';

import { Icon } from 'components/ui';
import type { TransactionID as TransactionIDType } from 'new/sdk/SolanaSDK';
import { getExplorerUrl, truncatingMiddle } from 'new/utils/StringExtensions';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;

  color: ${theme.colors.textIcon.secondary};
`;

const ExplorerBlockLink = styled.a`
  display: grid;
  grid-gap: 4px;

  color: inherit;
  font-size: inherit;
  text-align: right;
  text-decoration: none;
`;

const Address = styled.div`
  display: flex;
  align-items: center;

  color: ${theme.colors.textIcon.primary};
`;

const ExternalIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  margin-left: 4px;

  color: ${theme.colors.textIcon.secondary};
`;

interface Props {
  transactionID: TransactionIDType;
  network?: Network;
}

export const TransactionID: FC<Props> = ({ transactionID, network = 'mainnet-beta' }) => {
  return (
    <Wrapper>
      <div>Transaction ID</div>
      <ExplorerBlockLink
        href={getExplorerUrl('tx', transactionID, network)}
        target="_blank"
        rel="noopener noreferrer noindex"
      >
        <Address>
          {truncatingMiddle(transactionID, {
            numOfSymbolsRevealed: 9,
            numOfSymbolsRevealedInSuffix: 9,
          })}
          <ExternalIcon name="external" />
        </Address>
        <div>Tap to view in explorer</div>
      </ExplorerBlockLink>
    </Wrapper>
  );
};
