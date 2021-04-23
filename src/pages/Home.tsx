import React, { FunctionComponent, useState } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import app from 'components/pages/home/app.png';
import { LoaderWide } from 'components/pages/home/common/LoaderWide';
import { Login } from 'components/pages/home/Login';
import logo from 'components/pages/home/logo.svg';
import { Signup } from 'components/pages/home/Signup';
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

const AppImage = styled.div`
  position: absolute;
  z-index: 0;

  width: 820px;
  height: 526px;
  margin-top: 50px;

  background: url(${app}) no-repeat 50%;
  background-size: 820px 526px;
`;

const Right = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  max-width: 710px;
  padding-bottom: 20px;

  background: #fff;
`;

const Navigate = styled.div`
  display: flex;
  margin-bottom: 70px;

  border-bottom: 1px solid #16161626;
`;

const NavLinkStyled = styled(NavLink)`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 180px;
  height: 50px;

  color: #1616164c;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
  white-space: nowrap;
  text-align: center;
  text-decoration: none;

  cursor: pointer;

  &.active {
    color: #161616cc;

    &::after {
      position: absolute;
      right: 0;
      bottom: -1px;
      left: 0;

      height: 1px;

      background: #161616;

      content: '';
    }
  }
`;

export const global = css`
  :global() {
    ${fonts}
  }
`;

export const Home: FunctionComponent = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Wrapper>
      <Left>
        <Logo />
        <Title>
          Your crypto <TitleBold>is starting here</TitleBold>
        </Title>
        <AppImage />
      </Left>
      <Right>
        <Navigate>
          <NavLinkStyled to="/signup">Create new wallet</NavLinkStyled>
          <NavLinkStyled to="/login">I already have wallet</NavLinkStyled>
        </Navigate>
        <Switch>
          <Route path="/signup">
            <Signup setIsLoading={setIsLoading} />
          </Route>
          <Route path="/login">
            <Login setIsLoading={setIsLoading} />
          </Route>
        </Switch>
        {isLoading ? <LoaderWide /> : undefined}
      </Right>
    </Wrapper>
  );
};
