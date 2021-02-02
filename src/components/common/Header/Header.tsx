import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import Logo from 'assets/images/logo.png';

import { ClusterSelector } from 'components/common/ClusterSelector';

import { ScrollFix } from '../ScollFix';
import { HEADER_HEIGHT } from './constants';

const Wrapper = styled.header`
  position: relative;

  height: ${HEADER_HEIGHT}px;
`;

const FixedContainer = styled.div`
  position: fixed;
  z-index: 1;

  width: 100%;
  height: ${HEADER_HEIGHT}px;

  background: #fff;
  border-bottom: 1px solid #f6f6f8;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
`;

const ScrollFixContainer = styled(ScrollFix)`
  height: 100%;
  padding: 0 20px;
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  width: 100%;
  max-width: 796px;
  height: 100%;
  margin: 0 auto;
`;

const Content = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
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
      <FixedContainer>
        <ScrollFixContainer>
          <MainContainer>
            <Content>
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
            </Content>
          </MainContainer>
        </ScrollFixContainer>
      </FixedContainer>
    </Wrapper>
  );
};
