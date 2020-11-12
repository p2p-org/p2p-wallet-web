import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 10px;
`;

type Props = {
  order?: string[];
};

export const TokenList: FunctionComponent<Props> = ({ order }) => {
  if (!order) {
    return null;
  }

  return (
    <Wrapper>
      {order.map((publicKey) => (
        <TokenRow key={publicKey} publicKey={publicKey} />
      ))}
    </Wrapper>
  );
};
