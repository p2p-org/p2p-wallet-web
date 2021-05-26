import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { NavLink, Route, Switch, useLocation } from 'react-router-dom';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';

import { loadMnemonicAndSeed } from 'api/wallet/ManualWallet';
import { ToastManager } from 'components/common/ToastManager';
import { LoaderWide } from 'components/pages/home/common/LoaderWide';
import { Login } from 'components/pages/home/Login';
import { Signup } from 'components/pages/home/Signup';
import { autoConnect } from 'store/slices/wallet/WalletSlice';
import { sleep } from 'utils/common';

const Wrapper = styled.div`
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

export const Auth: FC = () => {
  const location = useLocation<{ from?: string }>();
  const history = useHistory();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const mount = async () => {
      const { seed } = await loadMnemonicAndSeed();

      if (!seed) {
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
    </Wrapper>
  );
};
