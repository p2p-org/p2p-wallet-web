import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';

import { up } from '../styles/breakpoints';
import LogoImg from './logo.png';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 50px;
`;

const Left = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-start;
`;

const Logo = styled.div`
  width: 80px;
  height: 18px;

  background: url('${LogoImg}') no-repeat 50% 50%;
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

const Center = styled.div`
  display: none;

  ${up.desktop} {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }
`;

const NavLink = styled.a`
  color: #fff;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 140%;
  text-decoration: none;

  &:not(:last-child) {
    margin-right: 44px;
  }
`;

const Right = styled.div`
  display: none;

  ${up.tablet} {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: flex-end;
  }
`;

const Button = styled.a`
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

export const Header: FC = () => {
  return (
    <Wrapper>
      <Left>
        <Logo />
        <Delimiter />
        <Wallet>Wallet</Wallet>
      </Left>
      <Center>
        <NavLink href="#explore">Explore</NavLink>
        <NavLink href="#about">About</NavLink>
        <NavLink href="#recent">Recent updates</NavLink>
        <NavLink href="#faq">FAQ</NavLink>
      </Center>
      <Right>
        <Link to="/login" component={Button}>
          I have a wallet
        </Link>
        <Link to="/signup" component={Button} className="white">
          Create wallet
        </Link>
      </Right>
    </Wrapper>
  );
};
