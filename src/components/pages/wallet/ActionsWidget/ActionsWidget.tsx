import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import web3 from '@solana/web3.js';
import { styled } from 'linaria/react';

import { Button, ButtonsGroup } from 'components/ui';

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
  const history = useHistory();

  const handleTokenChange = (token: string) => {
    history.push(`/wallet/${token}`);
  };

  return (
    <Wrapper>
      <TokenSelector value={publicKey.toBase58()} onChange={handleTokenChange} />

      <ButtonsGroup>
        {/* <Link to={`/send/${}`}> */}
        <Button primary small>
          Send
        </Button>
        {/* </Link> */}
        {/* <Button primary small> */}
        {/*  Buy */}
        {/* </Button> */}
        <Button primary small>
          Swap
        </Button>
      </ButtonsGroup>
    </Wrapper>
  );
};
