import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { useWallet } from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';

import { MOBILE_HEADER_HEIGHT } from './constants';
import logo from './logo.png';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: ${MOBILE_HEADER_HEIGHT}px;
  padding: 0 20px;

  border-bottom: 1px solid ${theme.colors.stroke.tertiary};
`;

const LogoLink = styled(Link)`
  color: #000;
  font-weight: bold;
  font-size: 22px;
  line-height: 120%;
  text-decoration: none;
`;

const LogoImg = styled.img`
  width: 32px;
  height: 32px;
`;

const Name = styled.span`
  margin-left: 12px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
`;

export const MobileHeader: FC = () => {
  const { connected } = useWallet();

  return (
    <Wrapper>
      <LogoLink to={connected ? '/wallets' : '/'}>
        <LogoImg src={logo} />
        <Name>Wallet</Name>
      </LogoLink>
    </Wrapper>
  );
};
