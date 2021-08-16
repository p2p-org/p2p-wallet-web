import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { TokenAccount } from 'api/token/TokenAccount';
import { Accordion } from 'components/ui';
import { getExplorerUrl } from 'utils/connection';

import { AddressQRCodePanel } from './AddressQRCodePanel';
import { BottomInfo, Description, ExplorerA } from './styled';

export const ReceiveSolana: FC = () => {
  const cluster = useSelector((state) => state.wallet.network.cluster);

  const availableTokenAccounts = useSelector((state) =>
    state.wallet.tokenAccounts.map((itemToken) => TokenAccount.from(itemToken)),
  );
  const publicKey = useSelector((state) => state.wallet.publicKey);
  const solAccount = useMemo(
    () => availableTokenAccounts.find((account) => account.address.toBase58() === publicKey),
    [availableTokenAccounts, publicKey],
  );

  if (!solAccount) {
    return null;
  }
  return (
    <>
      <Description>
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
      <AddressQRCodePanel address={solAccount.address.toBase58()} />
      <BottomInfo>
        <ExplorerA
          href={getExplorerUrl('address', solAccount.address.toBase58(), cluster)}
          target="_blank"
          rel="noopener noreferrer noindex"
          className="button">
          View in Solana explorer
        </ExplorerA>
      </BottomInfo>
    </>
  );
};
