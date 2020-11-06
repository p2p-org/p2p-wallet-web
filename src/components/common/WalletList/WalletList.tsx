import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { WalletItem } from 'components/common/WalletItem';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 10px;
`;

type Props = {
  items: any; // TODO: not any
};

export const WalletList: FunctionComponent<Props> = ({ items }) => {
  return (
    <Wrapper>
      {items.map((item, index) => (
        <WalletItem key={index} {...item} />
      ))}
    </Wrapper>
  );
};
