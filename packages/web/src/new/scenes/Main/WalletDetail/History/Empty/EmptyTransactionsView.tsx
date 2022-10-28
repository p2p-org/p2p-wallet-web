import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Empty } from 'components/common/Empty';

const Wrapper = styled.div``;

interface Props {
  onClick: () => void;
}

// TODO: make new empty state design
export const EmptyTransactionsView: FC<Props> = ({ onClick }) => {
  return (
    <Wrapper onClick={onClick}>
      <Empty
        type="activity"
        title="No transactions yet"
        desc="You didn’t make any transactions yet"
      />
    </Wrapper>
  );
};
