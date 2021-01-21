import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import { TokenAccount } from 'api/token/TokenAccount';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div``;

type Props = {
  items: TokenAccount[];
};

export const TokenList: FunctionComponent<Props> = ({ items = [] }) => {
  return (
    <Wrapper>
      {items
        .sort((a, b) => b.balance.cmp(a.balance))
        .map((item) => (
          <TokenRow key={item.address.toBase58()} token={item} />
        ))}
    </Wrapper>
  );
};
