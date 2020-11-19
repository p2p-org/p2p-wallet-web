import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { TokenType } from 'constants/tokens';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 2px;
`;

type Props = {
  items?: TokenType[]; // TODO: not any
  closeModal: () => void;
};

export const TokenList: FunctionComponent<Props> = ({ items, closeModal }) => {
  if (!items) {
    return null;
  }

  return (
    <Wrapper>
      {items.map((item) => (
        <TokenRow key={item.mintAddress} {...item} closeModal={closeModal} />
      ))}
    </Wrapper>
  );
};
