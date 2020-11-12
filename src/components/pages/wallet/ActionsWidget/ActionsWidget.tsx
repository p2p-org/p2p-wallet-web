import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router';

import { styled } from 'linaria/react';

import { Button, ButtonsGroup } from 'components/ui';

import { TokenSelector } from './TokenSelector';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

type Props = {
  symbol: string;
};

export const ActionsWidget: FunctionComponent<Props> = ({ symbol }) => {
  const history = useHistory();

  const handleTokenChange = (token: string) => {
    history.push(`/wallet/${token}`);
  };

  return (
    <Wrapper>
      <TokenSelector value={symbol} onChange={handleTokenChange} />

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
