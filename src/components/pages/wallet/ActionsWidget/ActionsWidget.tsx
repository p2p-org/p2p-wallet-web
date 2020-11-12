import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router';

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
  address: web3.PublicKey;
};

export const ActionsWidget: FunctionComponent<Props> = ({ address }) => {
  const history = useHistory();

  const handleTokenChange = (token: string) => {
    history.push(`/wallet/${token}`);
  };

  return (
    <Wrapper>
      <TokenSelector value={address.toBase58()} onChange={handleTokenChange} />

      <ButtonsGroup>
        <Button primary small>
          Send
        </Button>
        <Button primary small>
          Buy
        </Button>
        <Button primary small>
          Swap
        </Button>
      </ButtonsGroup>
    </Wrapper>
  );
};
