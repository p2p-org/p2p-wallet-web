import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';

import { TransactionRow } from '../TransactionRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 2px;

  > :first-child:not(:last-child) {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }

  > :last-child:not(:first-child) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  > :not(:first-child):not(:last-child) {
    border-radius: 0;
  }
`;

type Props = {
  order?: string[];
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
