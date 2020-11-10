import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { WalletItem } from 'components/common/WalletItem';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 10px;
`;

type Props = {
  order: string[];
};

export const WalletList: FunctionComponent<Props> = ({ order }) => {
  return (
    <Wrapper>
      {order.map((publicKey, index) => (
        <WalletItem key={publicKey} publicKey={publicKey} />
      ))}
    </Wrapper>
  );
};
