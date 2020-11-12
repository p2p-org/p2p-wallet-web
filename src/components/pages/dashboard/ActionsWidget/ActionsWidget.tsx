import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { Button } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Actions = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
`;

type Props = {};

export const ActionsWidget: FunctionComponent<Props> = (props) => {
  return (
    <Wrapper>
      <Actions>
        <Button primary>Send</Button>
        <Button primary>Receive</Button>
        <Button primary>Swap</Button>
      </Actions>
      <Button>Top-up with a card</Button>
    </Wrapper>
  );
};
