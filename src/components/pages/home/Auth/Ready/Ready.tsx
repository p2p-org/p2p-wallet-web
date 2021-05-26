import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';

import LogoImg from 'assets/images/big-logo.png';
import { Switch } from 'components/ui';

import { Button } from '../common/Button';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  width: 360px;
  margin-top: 200px;
`;

const TopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.div`
  width: 64px;
  height: 64px;

  background: url('${LogoImg}') no-repeat 50% 50%;
  background-size: 64px 64px;
`;

const Title = styled.span`
  display: inline-block;
  margin-top: 32px;

  color: #161616;
  font-weight: bold;
  font-size: 26px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 32px;
`;

const Desc = styled.span`
  margin-top: 8px;

  color: #161616;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;
  text-align: center;
`;

const SwitcherLabel = styled.label`
  display: flex;
  align-items: center;

  height: 52px;
  margin: 20px 0 32px;
  padding: 0 20px;

  background: #f6f6f8;
  border-radius: 12px;

  cursor: pointer;
`;

const SwitcherText = styled.span`
  margin-left: 20px;

  color: #161616;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;
`;

interface Props {
  type?: 'login' | 'signup';
  finish: (isSave: boolean) => void;
}

export const Ready: FC<Props> = ({ type, finish }) => {
  const [isSave, setIsSave] = useState(true);

  const handleIsSaveChange = (nextIsSave: boolean) => {
    setIsSave(nextIsSave);
  };

  const handleFinishClick = () => {
    finish(isSave);
  };

  return (
    <Wrapper>
      <TopWrapper>
        <Logo />
        <Title>{type === 'login' ? 'Welcome back!' : 'Your wallet is ready!'}</Title>
        <Desc>
          You can turn on a quick enter via password. Only you have access to your keys, not
          governmenе, not us, not anyone else. it’s 100% stored on your devices.{' '}
        </Desc>
      </TopWrapper>
      <SwitcherLabel>
        <Switch checked={isSave} onChange={handleIsSaveChange} />
        <SwitcherText>Use fast enter with password</SwitcherText>
      </SwitcherLabel>
      <Button onClick={handleFinishClick}>Finish setup</Button>
    </Wrapper>
  );
};
