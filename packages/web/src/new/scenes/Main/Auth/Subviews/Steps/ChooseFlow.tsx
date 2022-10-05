import type { FC } from 'react';
import { useState } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';

import { styled } from '@linaria/react';
import { useIsDesktop } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { LoaderWide } from 'components/common/LoaderWide';
import app from 'components/pages/auth/app.png';
import { Login } from 'components/pages/auth/AuthSide/Login';
import logo from 'components/pages/auth/logo.svg';
import { CreateWallet } from 'new/scenes/Main/Auth/Subviews/Forms/CreateWallet';

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

// @ts-ignore
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

const Navigate = styled.div`
  display: flex;
  margin-bottom: 70px;

  border-bottom: 1px solid #16161626;
`;

const MenuContainer = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;

  padding-bottom: 20px;

  background: #fff;
`;

export const ChooseFlow: FC = observer(() => {
  const isDesktop = useIsDesktop();
  const [isLoading, setIsLoading] = useState(false);

  const elBanner = isDesktop && (
    <Left>
      <Logo />
      <Title>
        Your crypto <TitleBold>is starting here</TitleBold>
      </Title>
      <AppImg src={app} />
    </Left>
  );

  const next = () => null;

  return (
    <Wrapper>
      {elBanner}
      <MenuContainer>
        <Navigate>
          <NavLinkStyled to="/create">Create new wallet</NavLinkStyled>
          <NavLinkStyled
            to="/restore"
            isActive={() => {
              return ['/restore', '/trial'].includes(location.pathname);
            }}
          >
            I already have wallet
          </NavLinkStyled>
        </Navigate>
        <Switch>
          <Route path={['/trial', '/restore']} exact>
            <Login setIsLoading={setIsLoading} next={next} />
          </Route>
          <Route path="/create">
            <CreateWallet />
          </Route>
        </Switch>
        {isLoading && <LoaderWide />}
      </MenuContainer>
    </Wrapper>
  );
});
