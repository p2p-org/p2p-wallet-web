import type { FC } from 'react';

import { styled } from '@linaria/react';
import { useWallet } from '@p2p-wallet-web/core';

import { useUsername } from 'app/contexts';
import { UsernameAddressWidget } from 'components/common/UsernameAddressWidget';
import { Accordion } from 'components/ui';
import { getExplorerUrl } from 'utils/connection';

import { BottomInfo, Description, ExplorerA, UsernameAddressWidgetWrapper } from './styled';

const InfoBlock = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 20px;

  background: #fafbfc;
  border-radius: 12px;
`;

export const ReceiveSolana: FC = () => {
  const { network, publicKey } = useWallet();
  const { username, domain } = useUsername();

  if (!publicKey) {
    return null;
  }

  return (
    <>
      <Description>
        <InfoBlock>
          <div>
            Receive any token within the <strong>Solana network</strong> even if it is not included
            in your wallet list
          </div>
        </InfoBlock>
        <Accordion title="Which cryptocurrencies can I use?">
          The Solana Program Library (SPL) is a collection of on-chain programs maintained by the
          Solana team. The SPL Token program is the token standard of the Solana blockchain.
          <br />
          <br />
          Similar to ERC20 tokens on the Ethereum network, SPL Tokens are designed for DeFi
          applications. SPL Tokens can be traded on Serum, a Solana based decentralized exchange and
          FTX.
        </Accordion>
      </Description>
      <UsernameAddressWidgetWrapper>
        <UsernameAddressWidget
          address={publicKey?.toBase58() || ''}
          username={username ? `${username}${domain}` : ''}
        />
      </UsernameAddressWidgetWrapper>
      <BottomInfo>
        <ExplorerA
          href={getExplorerUrl('address', publicKey.toBase58(), network)}
          target="_blank"
          rel="noopener noreferrer noindex"
          className="button"
        >
          View in Solana explorer
        </ExplorerA>
      </BottomInfo>
    </>
  );
};
