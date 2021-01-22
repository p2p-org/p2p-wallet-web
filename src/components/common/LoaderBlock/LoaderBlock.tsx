import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import { Loader } from 'components/common/Loader';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 86px;
`;

export const LoaderBlock: FunctionComponent = () => {
  return (
    <Wrapper>
      <Loader />
    </Wrapper>
  );
};
