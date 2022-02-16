import type { FunctionComponent } from 'react';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useIsDesktop } from '@p2p-wallet-web/ui';

import app from 'components/pages/auth/app.png';
import { AuthSide } from 'components/pages/auth/AuthSide';
import logo from 'components/pages/auth/logo.svg';
import { fonts } from 'components/pages/landing/styles/fonts';

const Wrapper = styled.div`
  display: flex;
  min-height: 100%;
`;

const Left = styled.div`
  position: relative;

  flex: 1;
  padding: 20px 50px 50px;
  overflow: hidden;

  background: #f5f7fe;
`;

const Logo = styled.div`
  width: 32px;
  height: 24px;

  background: url(${logo}) no-repeat 50%;
`;

const Title = styled.span`
  display: inline-block;
  margin-top: 67px;

  color: #161616;
  font-size: 32px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 40px;
`;

const TitleBold = styled.strong`
  display: block;

  font-weight: 900;
`;

const AppImg = styled.img`
  position: absolute;
  z-index: 0;

  display: block;

  width: 110%;
  min-width: 820px;
  margin-top: 50px;

  filter: drop-shadow(-34px 42px 100px rgba(0, 0, 0, 0.05));
`;

export const global = css`
  :global() {
    ${fonts}
  }
`;

export const Auth: FunctionComponent = () => {
  const isDesktop = useIsDesktop();

  return (
    <Wrapper>
      {isDesktop ? (
        <Left>
          <Logo />
          <Title>
            Your crypto <TitleBold>is starting here</TitleBold>
          </Title>
          <AppImg src={app} />
        </Left>
      ) : undefined}
      <AuthSide />
    </Wrapper>
  );
};
