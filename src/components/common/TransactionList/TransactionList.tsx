import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { TransactionRow } from '../TransactionRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 2px;

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
