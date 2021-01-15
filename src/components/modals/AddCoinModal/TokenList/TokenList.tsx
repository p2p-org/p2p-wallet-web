import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import { Token } from 'api/token/Token';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 2px;
`;

type Props = {
  items?: Token[];
  closeModal: () => void;
};

export const TokenList: FunctionComponent<Props> = ({ items, closeModal }) => {
  if (!items) {
    return null;
  }

  return (
    <Wrapper>
      {items.map((token) => (
        <TokenRow key={token.address.toBase58()} token={token} closeModal={closeModal} />
      ))}
    </Wrapper>
  );
};
