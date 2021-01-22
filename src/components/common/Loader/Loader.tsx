import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import loader from './loader.png';

const Wrapper = styled.div``;

const LoaderImg = styled.img`
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  width: 20px;
  height: 20px;

  animation: rotate 1s linear infinite;
`;

export const Loader: FunctionComponent = () => {
  return (
    <Wrapper>
      <LoaderImg src={loader as string} />
    </Wrapper>
  );
};
