import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { TokenType } from 'constants/tokens';

import { TokenItem } from '../TokenItem';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 2px;
`;

type Props = {
  items?: TokenType[]; // TODO: not any
};

export const TokenList: FunctionComponent<Props> = ({ items }) => {
  if (!items) {
    return null;
  }

  return (
    <Wrapper>
      {items.map((item) => (
        <TokenItem key={item.mintAddress} {...item} />
      ))}
    </Wrapper>
  );
};
