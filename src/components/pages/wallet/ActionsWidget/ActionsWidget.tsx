import React, { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';

import { Button, ButtonsGroup } from 'components/ui';
import { requestAirdrop } from 'store/actions/solana';
import { RootState, TokenAccount } from 'store/types';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';

import { TokenSelector } from './TokenSelector';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

type Props = {
  publicKey: web3.PublicKey;
};

export const ActionsWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const entrypoint = useSelector((state: RootState) => state.data.blockchain.entrypoint);
  const isMainnetEntrypoint = entrypoint === web3.clusterApiUrl('mainnet-beta');

  const tokenAccount: TokenAccount = useSelector(
    (state: RootState) => state.entities.tokens.items[publicKey.toBase58()],
  );
  const { mint } = tokenAccount?.parsed || {};
  const { symbol } = usePopulateTokenInfo({ mint: mint?.toBase58() });

  const handleTokenChange = (token: string) => {
    history.push(`/wallet/${token}`);
  };

  const handleAirdropClick = () => {
    dispatch(requestAirdrop());
  };

  return (
    <Wrapper>
      <TokenSelector value={publicKey.toBase58()} onChange={handleTokenChange} />

      <ButtonsGroup>
        <Button primary small as={Link} to={`/send/${symbol || publicKey.toBase58()}`}>
          Send
        </Button>
        {/* <Button primary small> */}
        {/*  Buy */}
        {/* </Button> */}
        <Button primary small as={Link} to={`/swap/${symbol || publicKey.toBase58()}`}>
          Swap
        </Button>
        {!isMainnetEntrypoint ? (
          <Button primary small onClick={handleAirdropClick}>
            Airdrop
          </Button>
        ) : undefined}
      </ButtonsGroup>
    </Wrapper>
  );
};
