import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import Logo from 'assets/images/logo.png';

import { ClusterSelector } from 'components/common/ClusterSelector';

const Wrapper = styled.header`
  position: relative;

  display: flex;
  justify-content: center;

  height: 64px;
  padding: 0 20px;

  white-space: nowrap;

  background: #fff;
  border-bottom: 1px solid #f6f6f8;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
`;

const ContainerScrollFix = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 796px;
`;

const LogoLink = styled(Link)`
  color: #000;
  font-weight: bold;
  font-size: 22px;
  line-height: 120%;
  text-decoration: none;
`;

const LogoImg = styled.img`
  width: 108px;
  height: 38px;
`;

// const Nav = styled.div`
//   display: grid;
//   grid-auto-flow: column;
//   grid-gap: 40px;
//
//   padding: 0 16px;
// `;

// const NavLink = styled(Link)`
//   color: ${rgba('#000', 0.5)};
//   font-size: 14px;
//   line-height: 140%;
//   text-decoration: none;
//
//   &:hover {
//     color: #000;
//   }
// `;

export const Header: FunctionComponent = () => {
  return (
    <Wrapper>
      <ContainerScrollFix>
        <LogoLink to="/wallets">
          <LogoImg src={Logo as string} />
        </LogoLink>
        {/* <Nav> */}
        {/*  /!*<NavLink to="/wallets">Wallets</NavLink>*!/ */}
        {/*  /!* <NavLink to="/">Investments</NavLink> *!/ */}
        {/*  /!* <NavLink to="/">Explore</NavLink> *!/ */}
        {/*  /!* <NavLink to="/dashboard_old">Contacts</NavLink> *!/ */}
        {/* </Nav> */}
        <ClusterSelector />
      </ContainerScrollFix>
    </Wrapper>
  );
};
