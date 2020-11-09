import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { TokenItem } from '../TokenItem';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 2px;
`;

type Props = {
  items: any; // TODO: not any
};

export const TokenList: FunctionComponent<Props> = ({ items }) => {
  return (
    <Wrapper>
      {items.map((item, index) => (
        <TokenItem key={index} {...item} />
      ))}
    </Wrapper>
  );
};
