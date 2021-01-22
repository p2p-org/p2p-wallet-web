import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { TransactionSignature } from '@solana/web3.js';

import { TransactionRow } from '../TransactionRow';

const Wrapper = styled.div`
  margin: 0 10px;
`;

type Props = {
  order?: TransactionSignature[];
};

export const TransactionList: FunctionComponent<Props> = ({ order }) => {
  if (!order) {
    return null;
  }

  return (
    <Wrapper>
      {order.map((signature) => (
        <TransactionRow key={signature} signature={signature} />
      ))}
    </Wrapper>
  );
};
