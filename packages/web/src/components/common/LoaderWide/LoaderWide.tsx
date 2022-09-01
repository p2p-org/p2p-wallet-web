import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Loader } from 'components/common/Loader';

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(255, 255, 255, 0.9);
`;

const LoaderStyled = styled(Loader)`
  width: 64px;
  height: 64px;

  &::after {
    width: 88%;
    height: 88%;
  }
`;

const Logo = styled.div`
  position: absolute;

  width: 44px;
  height: 44px;

  background: url('logo-loader.svg') no-repeat 50%;
  background-size: 44px 44px;
`;

export const LoaderWide: FC = () => {
  return (
    <Wrapper>
      <LoaderStyled />
      <Logo />
    </Wrapper>
  );
};
