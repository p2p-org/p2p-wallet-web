import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 10px;
`;

type Props = {
  // order?: string[];
  items: any;
};

export const TokenList: FunctionComponent<Props> = ({
  // order
  items,
}) => {
  if (!items) {
    return null;
  }

  return (
    <Wrapper>
      {items.map((item) => (
        <TokenRow key={item} token={item} />
      ))}
    </Wrapper>
  );
};
