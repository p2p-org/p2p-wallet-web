import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import { Loader } from 'components/common/Loader';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 33px 0;
`;

export const LoaderBlock: FunctionComponent = () => {
  return (
    <Wrapper>
      <Loader />
    </Wrapper>
  );
};
