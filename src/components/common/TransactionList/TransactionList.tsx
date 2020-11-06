import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { TransactionItem } from 'components/common/TransactionItem';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 2px;
`;

type Props = {
  items: any; // TODO: not any
};

export const TransactionList: FunctionComponent<Props> = ({ items }) => {
  return (
    <Wrapper>
      {items.map((item, index) => (
        <TransactionItem key={index} {...item} />
      ))}
    </Wrapper>
  );
};
