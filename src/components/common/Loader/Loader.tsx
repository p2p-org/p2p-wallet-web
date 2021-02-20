import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.div`
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  position: relative;

  width: 20px;
  height: 20px;
  margin: 0 auto;
  overflow: hidden;

  border-radius: 50%;

  animation: spin 1s linear infinite;

  &::after {
    position: absolute;

    top: 50%;
    left: 50%;

    width: 80%;
    height: 80%;

    background: #fff;
    border-radius: 50%;
    transform: translate(-50%, -50%);

    content: '';
  }
`;

const Inner = styled.div`
  position: absolute;

  width: 100%;
  height: 50%;
  margin-top: 50%;

  background: linear-gradient(90deg, #5987ff, #d3dffe);

  &::before {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    margin-top: -50%;

    background: linear-gradient(90deg, #f9fafe, #d3dffe);

    content: '';
  }
`;

export const Loader: FunctionComponent = (props) => {
  return (
    <Wrapper {...props}>
      <Inner />
    </Wrapper>
  );
};
