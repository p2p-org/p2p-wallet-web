import React, { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { NavLink, Route, Switch, useLocation } from 'react-router-dom';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';

import { ToastManager } from 'components/common/ToastManager';
import app from 'components/pages/home/app.png';
import { LoaderWide } from 'components/pages/home/common/LoaderWide';
import { Login } from 'components/pages/home/Login';
import logo from 'components/pages/home/logo.svg';
import { Signup } from 'components/pages/home/Signup';
import { fonts } from 'components/pages/landing/styles/fonts';
import { autoConnect, STORAGE_KEY_SEED } from 'store/slices/wallet/WalletSlice';
import { sleep } from 'utils/common';

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

const Right = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;

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
  const location = useLocation<{ from?: string }>();
  const history = useHistory();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const mount = async () => {
      if (!localStorage.getItem(STORAGE_KEY_SEED)) {
        return;
      }

      try {
        setIsLoading(true);
        unwrapResult(await dispatch(autoConnect()));

        await sleep(100);

        history.push(location.state?.from || '/wallets');
      } catch (error) {
        ToastManager.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void mount();
  }, []);

  return (
    <Wrapper>
      <Left>
        <Logo />
        <Title>
          Your crypto <TitleBold>is starting here</TitleBold>
        </Title>
        <AppImg src={app} />
      </Left>
      <Right>
        <Navigate>
          <NavLinkStyled to="/signup">Create new wallet</NavLinkStyled>
          <NavLinkStyled to="/login" isActive={() => ['/login', '/'].includes(location.pathname)}>
            I already have wallet
          </NavLinkStyled>
        </Navigate>
        <Switch>
          <Route path="/" exact>
            <Login setIsLoading={setIsLoading} />
          </Route>
          <Route path="/login">
            <Login setIsLoading={setIsLoading} />
          </Route>
          <Route path="/signup">
            <Signup setIsLoading={setIsLoading} />
          </Route>
        </Switch>
        {isLoading ? <LoaderWide /> : undefined}
      </Right>
    </Wrapper>
  );
};
