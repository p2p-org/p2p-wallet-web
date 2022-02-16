import type { FC } from 'react';

import { styled } from '@linaria/react';

import LogoImg from 'assets/images/big-logo.png';
import { ButtonIOS, ButtonWeb } from 'components/pages/landing/common/Button/Button';
import { trackEvent } from 'utils/analytics';

import { up } from '../styles/breakpoints';

const Wrapper = styled.div`
  z-index: 2;

  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 56px;

  ${up.mobileLandscape} {
    margin-top: 120px;
  }

  ${up.tablet} {
    margin-top: 124px;
  }

  ${up.desktop} {
    margin-top: 94px;
  }
`;

const Logo = styled.div`
  width: 64px;
  height: 64px;

  background: url('${LogoImg}') no-repeat 50% 50%;
  background-size: 64px 64px;
`;

const Title = styled.span`
  display: inline-block;

  max-width: 330px;
  margin-top: 56px;

  color: #f9f9f9;
  font-weight: bold;
  font-size: 46px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 52px;
  text-align: center;

  ${up.mobileLandscape} {
    max-width: 470px;
    margin-top: 64px;

    font-size: 64px;
    line-height: 64px;
  }

  ${up.tablet} {
    max-width: 818px;
    margin-top: 56px;
  }

  ${up.desktop} {
    max-width: 999px;
    margin-top: 72px;

    font-size: 84px;
    line-height: 84px;
  }
`;

const TitleGreen = styled.span`
  color: #bcff4e;

  text-shadow: 0 0 #0000;

  background-image: linear-gradient(180deg, #e6ff4e 0%, #bcff4e 100%);

  /* Use the text as a mask for the background.
  This will show the gradient as a text color rather than element bg. */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-box-decoration-break: clone;
`;

const Description = styled.span`
  display: none;

  ${up.tablet} {
    display: initial;
    max-width: 587px;
    margin-top: 20px;

    color: #f9f9f9;
    font-size: 20px;
    font-family: 'Aktiv Grotesk Corp', sans-serif;
    line-height: 140%;
    text-align: center;

    &.line-through {
      color: #4e4e4e;
      text-decoration: line-through;
    }
  }

  ${up.desktop} {
    font-size: 24px;
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 56px;
  padding: 0 40px;

  & > :not(:last-child) {
    margin-bottom: 20px;
  }

  ${up.mobileLandscape} {
    flex-direction: row;
    margin-top: 72px;

    & > :not(:last-child) {
      margin-right: 20px;
      margin-bottom: 0;
    }
  }

  ${up.tablet} {
    margin-top: 76px;
  }

  ${up.desktop} {
    margin-top: 50px;
  }
`;

export const Top: FC = () => {
  return (
    <Wrapper>
      <Logo />
      <Title>
        A wallet with super-speed and <TitleGreen>free transactions</TitleGreen>
      </Title>
      <Description>
        <Description className="line-through">One more</Description> The first ever wallet where you
        can send money with free transactions and without hidden fees.{' '}
      </Description>
      <ButtonsWrapper>
        <ButtonWeb glow onClick={() => trackEvent('landing_go_to_web_wallet_1_click')} />
        <ButtonIOS glow onClick={() => trackEvent('landing_download_for_ios_1_click')} />
      </ButtonsWrapper>
    </Wrapper>
  );
};
