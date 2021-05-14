import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';

import { up, useBreakpoint } from 'components/pages/landing/styles/breakpoints';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;

  width: 100vw;
  height: 100vh;
`;

const DrawerBg = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;

  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
`;

const CloseIcon = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;

  width: 44px;
  height: 44px;

  background: url('./close.svg') no-repeat 50%;
  background-size: 22px 22px;
`;

const DrawerMenu = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 2;

  display: flex;
  flex-direction: column;
  width: 66.6%;
  overflow-y: auto;

  background: #161616;
`;

const Logo = styled.div`
  margin: 15px 0 32px 24px;

  color: #fff;
  font-size: 24px;
  font-family: 'GT Super Txt Trial', sans-serif;
  line-height: 140%;
`;

const MenuA = styled.a`
  min-width: 250px;
  padding: 24px 18px;

  color: #f9f9f9;
  font-size: 20px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 140%;
  text-decoration: none;

  &.green {
    color: #bcff4e;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

type Props = {
  isOpen: boolean;
  onDrawerClose: () => void;
};

export const Drawer: FC<Props> = ({ isOpen, onDrawerClose }) => {
  const isDesktop = useBreakpoint(up.desktop);

  if (isDesktop || !isOpen) {
    return null;
  }

  const handleCloseClick = () => {
    onDrawerClose();
  };

  return (
    <>
      <Wrapper>
        <DrawerBg onClick={handleCloseClick}>
          <CloseIcon />
        </DrawerBg>
        <DrawerMenu>
          <Logo>Wallet</Logo>
          {/* <MenuA href="/#">Explore</MenuA> */}
          {/* <MenuA href="/#">About</MenuA> */}
          {/* <MenuA href="/#">Recent Updates</MenuA> */}
          {/* <MenuA href="/#">FAQ</MenuA> */}
          <Link to="/login" component={MenuA}>
            I have a wallet
          </Link>
          <Link to="/signup" component={MenuA} className="green">
            Create new wallet
          </Link>
        </DrawerMenu>
      </Wrapper>
    </>
  );
};
