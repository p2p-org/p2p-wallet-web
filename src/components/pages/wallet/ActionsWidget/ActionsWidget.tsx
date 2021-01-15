import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { Button, ButtonsGroup } from 'components/ui';
import { RootState } from 'store/rootReducer';
import { airdrop } from 'store/slices/wallet/WalletSlice';

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
  const isMainnet = cluster === 'mainnet-beta';

  const handleTokenChange = (token: string) => {
    history.push(`/wallet/${token}`);
  };

  const handleAirdropClick = () => {
    void dispatch(airdrop());
  };

  return (
    <Wrapper>
      <TokenSelector value={publicKey.toBase58()} onChange={handleTokenChange} />

      <ButtonsGroup>
        <Link to={`/send/${publicKey.toBase58()}`} className="button">
          <Button primary small>
            Send
          </Button>
        </Link>
        {/* <Button primary small> */}
        {/*  Buy */}
        {/* </Button> */}
        <Link to={`/swap/${publicKey.toBase58()}`} className="button">
          <Button primary small>
            Swap
          </Button>
        </Link>
        {!isMainnet && tokenAccount?.mint.symbol === 'SOL' ? (
          <Button primary small onClick={handleAirdropClick}>
            Airdrop
          </Button>
        ) : undefined}
      </ButtonsGroup>
    </Wrapper>
  );
};
