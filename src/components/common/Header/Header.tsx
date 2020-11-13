import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { NetworkSelect } from 'components/common/NetworkSelect';
import { Avatar } from 'components/ui';

const Wrapper = styled.header`
  position: relative;

  display: flex;
  justify-content: center;

  height: 64px;
  padding: 0 20px;

  white-space: nowrap;

  background: #fff;
  border-bottom: 1px solid ${rgba('#000', 0.1)};
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1260px;
`;

const LogoLink = styled(Link)`
  color: #000;
  font-weight: bold;
  font-size: 22px;
  line-height: 120%;
  text-decoration: none;
`;

const Nav = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 40px;

  padding: 0 16px;
`;

const NavLink = styled(Link)`
  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 140%;
  text-decoration: none;

  &:hover {
    color: #000;
  }
`;

const HeaderAuth = styled.div`
  display: flex;
  align-items: center;

  cursor: pointer;
`;

// temp, will be in profile settings
const NetworkWrapper = styled.div`
  margin-right: 15px;
`;

const AvatarStyled = styled(Avatar)`
  width: 36px;
  height: 36px;

  background: #c4c4c4;
`;

const Username = styled.div`
  margin-left: 16px;

  font-weight: 500;
  font-size: 14px;
  line-height: 120%;
`;

type Props = {};

export const Header: FunctionComponent<Props> = (props) => {
  return (
    <Wrapper>
      <Container>
        <LogoLink to="/wallets">P2P Wallet</LogoLink>
        {/* <Nav> */}
        {/*  /!*<NavLink to="/wallets">Wallets</NavLink>*!/ */}
        {/*  /!* <NavLink to="/">Investments</NavLink> *!/ */}
        {/*  /!* <NavLink to="/">Explore</NavLink> *!/ */}
        {/*  /!* <NavLink to="/dashboard_old">Contacts</NavLink> *!/ */}
        {/* </Nav> */}
        <HeaderAuth>
          <NetworkWrapper>
            <NetworkSelect />
          </NetworkWrapper>
          {/* <AvatarStyled /> */}
          {/* <Username>Konstantin</Username> */}
        </HeaderAuth>
      </Container>
    </Wrapper>
  );
};
