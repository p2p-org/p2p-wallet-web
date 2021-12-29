import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';

import { trackEvent } from 'utils/analytics';

import { up, useBreakpoint } from '../styles/breakpoints';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 20px 0 10px;
`;

const Left = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-start;
`;

const HamburgerIcon = styled.div`
  width: 44px;
  height: 44px;
  margin-right: 10px;

  background: url('./hamburger.svg') no-repeat 50% 50%;
  background-size: 24px 24px;
  cursor: pointer;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  width: 80px;
  height: 18px;
  margin-left: 10px;

  background: url('./logo.svg') no-repeat 50% 50%;
  background-size: 80px 18px;
`;

const Delimiter = styled.div`
  width: 1px;
  height: 34px;
  margin: 0 24px 0 31px;

  background: rgba(255, 255, 255, 0.2);
`;

const Wallet = styled.div`
  color: #fff;
  font-weight: bold;
  font-size: 24px;
  font-family: 'GT Super Txt Trial', sans-serif;
  line-height: 140%;
`;

// const Center = styled.div`
//   display: flex;
//   flex: 1;
//   align-items: center;
//   justify-content: center;
// `;
//
// const NavLink = styled.a`
//   color: #fff;
//   font-weight: 500;
//   font-size: 16px;
//   font-family: 'Aktiv Grotesk Corp', sans-serif;
//   line-height: 140%;
//   text-decoration: none;
//
//   &:not(:last-child) {
//     margin-right: 44px;
//   }
// `;

const Right = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-end;
`;

const Button = styled(Link)`
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 36px;

  color: #fff;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 140%;
  text-decoration: none;

  background: rgba(255, 255, 255, 0.05);
  border-radius: 32px;

  transition: color 0.1s, background 0.1s;

  &.white {
    color: #000;

    background: #fff;

    &:hover {
      color: #000;

      background: #bcff4e;
    }
  }

  &:not(:last-child) {
    margin-right: 16px;
  }

  &:hover {
    color: #000;

    background: #fff;
  }
`;

type Props = {
  onDrawerToggle: () => void;
};

export const Header: FC<Props> = ({ onDrawerToggle }) => {
  const isTablet = useBreakpoint(up.tablet);
  // const isDesktop = useBreakpoint(up.desktop);

  const handleHamburgerClick = () => {
    onDrawerToggle();
  };

  return (
    <Wrapper>
      <Left>
        {/* // isDesktop */}
        {isTablet ? <HamburgerIcon onClick={handleHamburgerClick} /> : undefined}
        <LogoWrapper>
          <Logo />
          <Delimiter />
          <Wallet>Wallet</Wallet>
        </LogoWrapper>
      </Left>
      {/* {isDesktop ? ( */}
      {/*  <Center> */}
      {/*    <NavLink href="#explore">Explore</NavLink> */}
      {/*    <NavLink href="#about">About</NavLink> */}
      {/*    <NavLink href="#recent">Recent updates</NavLink> */}
      {/*    <NavLink href="#faq">FAQ</NavLink> */}
      {/*  </Center> */}
      {/* ) : undefined} */}
      {isTablet ? (
        <Right>
          <Button to="/login" onClick={() => trackEvent('landing_i_have_wallet_click')}>
            I have a wallet
          </Button>
          <Button
            to="/signup"
            onClick={() => trackEvent('landing_create_wallet_click')}
            className="white"
          >
            Create wallet
          </Button>
        </Right>
      ) : undefined}
    </Wrapper>
  );
};
