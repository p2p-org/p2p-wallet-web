import type { FC } from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router';
import { NavLink, Route, Switch, useLocation } from 'react-router-dom';

import { styled } from '@linaria/react';
import { useWallet } from '@p2p-wallet-web/core';

import { useUpdateEffect } from 'utils/hooks/useUpdateEffect';

import { LoaderWide } from '../../../common/LoaderWide';
import { Login } from './Login';
import { Ready } from './Ready';
import { Signup } from './Signup';
import type { DataType } from './types';

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

export const AuthSide: FC = () => {
  const history = useHistory();
  const location = useLocation<{ fromPage?: string }>();
  const { connected } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<DataType>({
    type: undefined,
    mnemonic: '',
    seed: '',
    derivationPath: '',
    password: '',
  });

  useUpdateEffect(() => {
    if (connected) {
      history.push(location.state?.fromPage || '/wallets', {
        fromPage: location.state?.fromPage || location.pathname,
      });
    }
  }, [connected]);

  const next = (nextData: DataType) => {
    setData(nextData);
  };

  const render = () => {
    if (data.seed) {
      return <Ready setIsLoading={setIsLoading} data={data} />;
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
