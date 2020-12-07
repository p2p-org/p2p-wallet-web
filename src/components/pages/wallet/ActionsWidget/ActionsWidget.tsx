import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { Button, ButtonsGroup } from 'components/ui';
import { airdrop } from 'features/wallet/WalletSlice';
import { RootState } from 'store/rootReducer';

import { TokenSelector } from './TokenSelector';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

type Props = {
  publicKey: PublicKey;
};

export const ActionsWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const cluster = useSelector((state: RootState) => state.wallet.cluster);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const tokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.equals(publicKey)),
    [tokenAccounts, publicKey],
  );
  const isMainnet = cluster === clusterApiUrl('mainnet-beta');

  const handleTokenChange = (token: string) => {
    history.push(`/wallet/${token}`);
  };

  const handleAirdropClick = () => {
    dispatch(airdrop());
  };

  return (
    <Wrapper>
      <TokenSelector value={publicKey.toBase58()} onChange={handleTokenChange} />

      <ButtonsGroup>
        <Button primary small as={Link} to={`/send/${publicKey.toBase58()}`}>
          Send
        </Button>
        {/* <Button primary small> */}
        {/*  Buy */}
        {/* </Button> */}
        <Button primary small as={Link} to={`/swap/${publicKey.toBase58()}`}>
          Swap
        </Button>
        {!isMainnet && tokenAccount?.mint.symbol === 'SOL' ? (
          <Button primary small onClick={handleAirdropClick}>
            Airdrop
          </Button>
        ) : undefined}
      </ButtonsGroup>
    </Wrapper>
  );
};
