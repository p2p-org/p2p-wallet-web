import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { rgba } from 'polished';

import logoImg from 'assets/images/big-logo.png';
import { Icon } from 'components/ui';

import androidImg from './android.svg';
import appleImg from './apple.svg';

const Wrapper = styled.div`
  background: #fff;
  border-radius: 12px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 0 20px;

  cursor: pointer;
`;

const Title = styled.span`
  position: relative;

  color: #202020;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;

  &.isWasntOpened {
    &::before {
      position: absolute;
      top: -1px;
      right: -8px;

      width: 6px;
      height: 6px;

      background: #f43d3d;
      border-radius: 12px;

      content: '';
    }
  }
`;

const ChevronIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: ${rgba('#a3a5ba', 0.35)};

  transform: rotate(-90deg);
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 16px;
  padding: 16px 20px 20px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  text-align: center;

  border-top: 1px solid ${rgba('#000000', 0.05)};
`;

const LogoImg = styled.div`
  width: 56px;
  height: 56px;

  background: url('${logoImg}') no-repeat 50%;
  background-size: 56px 56px;
`;

const ButtonsWrapper = styled.div`
  display: flex;

  column-gap: 8px;
`;

const Button = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 102px;
  height: 36px;

  background: #202020;
  border-radius: 12px;
`;

const AppleImg = styled.div`
  width: 20px;
  height: 20px;

  background: url('${appleImg}') no-repeat 50%;
  background-size: 20px 20px;
`;

const AndroidImg = styled.div`
  width: 20px;
  height: 20px;

  background: url('${androidImg}') no-repeat 50%;
  background-size: 20px 20px;
`;

const STORAGE_KEY = 'isWasDownloadOpened';

export const Download: FC = () => {
  const [isWasntOpened, setIsWasntOpened] = useState(!localStorage.getItem(STORAGE_KEY));
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleClick = () => {
    setIsOpen((state) => !state);

    if (isWasntOpened) {
      setIsWasntOpened(false);
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  return (
    <Wrapper>
      <Header onClick={handleToggleClick}>
        <Title className={classNames({ isWasntOpened })}>Download app</Title>
        <ChevronIcon name="chevron" />
      </Header>
      {isOpen ? (
        <Content>
          <LogoImg />
          Your P2P Wallet in your pocket! All web functionallity in our app. Secure, fast and native
          apps.
          <ButtonsWrapper>
            <Button to="/">
              <AppleImg />
            </Button>
            <Button to="/">
              <AndroidImg />
            </Button>
          </ButtonsWrapper>
        </Content>
      ) : undefined}
    </Wrapper>
  );
};
