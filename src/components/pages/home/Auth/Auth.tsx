import React, { FC, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { NavLink, Route, Switch, useLocation } from 'react-router-dom';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';

import { WalletType } from 'api/wallet';
import { storeMnemonicAndSeed } from 'api/wallet/ManualWallet';
import { ToastManager } from 'components/common/ToastManager';
import { connectWallet, selectType } from 'store/slices/wallet/WalletSlice';
import { sleep } from 'utils/common';

import { LoaderWide } from './common/LoaderWide';
import { Login } from './Login';
import { Ready } from './Ready';
import { Signup } from './Signup';
import { DataType } from './types';

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
  const [data, setData] = useState<DataType>({
    type: undefined,
    mnemonic: '',
    seed: '',
    derivationPath: '',
    password: '',
  });

  const finish = (currentData: DataType) => (isSave?: boolean) => {
    batch(async () => {
      try {
        setIsLoading(true);
        dispatch(selectType(WalletType.MANUAL));
        unwrapResult(
          await dispatch(
            connectWallet({
              seed: currentData.seed,
              password: currentData.password,
              derivationPath: currentData.derivationPath,
            }),
          ),
        );
        await storeMnemonicAndSeed(
          currentData.mnemonic,
          currentData.seed,
          currentData.derivationPath,
          currentData.password,
          isSave,
        );
        await sleep(100);
        history.push('/wallets');
        // eslint-disable-next-line @typescript-eslint/no-shadow
      } catch (error) {
        ToastManager.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const next = (nextData: DataType) => {
    if (nextData.password) {
      setData(nextData);
    } else {
      finish(nextData)();
    }
  };

  const render = () => {
    if (data.seed) {
      return <Ready type={data.type} finish={finish(data)} />;
    }

    return (
      <>
        <Navigate>
          <NavLinkStyled to="/signup">Create new wallet</NavLinkStyled>
          <NavLinkStyled to="/login" isActive={() => ['/login', '/'].includes(location.pathname)}>
            I already have wallet
          </NavLinkStyled>
        </Navigate>
        <Switch>
          <Route path={['/', '/login']} exact>
            <Login setIsLoading={setIsLoading} next={next} />
          </Route>
          <Route path="/signup">
            <Signup next={next} />
          </Route>
        </Switch>
      </>
    );
  };

  return (
    <Wrapper>
      {render()}
      {isLoading ? <LoaderWide /> : undefined}
    </Wrapper>
  );
};
