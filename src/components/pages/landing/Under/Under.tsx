import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { ButtonIOS } from 'components/pages/landing/common/Button/Button';
import { trackEvent } from 'utils/analytics';

import { up } from '../styles/breakpoints';

const Wrapper = styled.div`
  position: relative;
  z-index: 1;

  margin: 80px 0 100px;

  ${up.mobileLandscape} {
    margin: 120px 0 100px;
  }

  ${up.tablet} {
    margin: 140px 0 154px;
  }

  ${up.desktop} {
    margin: 230px 0 175px;
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 40px;
`;

const Title = styled.div`
  max-width: 295px;

  color: #161616;
  font-size: 36px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 44px;
  text-align: center;

  ${up.mobileLandscape} {
    max-width: 488px;

    font-size: 48px;
    line-height: 54px;
  }

  ${up.tablet} {
    max-width: 750px;

    font-size: 48px;
    line-height: 56px;
  }

  ${up.desktop} {
    max-width: 1067px;

    font-size: 60px;
    line-height: 64px;
  }
`;

const Bold = styled.span`
  position: relative;

  display: inline-block;

  font-weight: 900;

  ${up.tablet} {
    &::after {
      position: absolute;
      right: -50px;
      bottom: -60px;

      width: 37px;
      height: 81px;

      background: url('./top-curve.png') no-repeat 50% 50%;
      background-size: 37px 81px;

      content: '';
    }
  }
`;

const Middle = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  padding: 64px 40px;

  overflow-x: auto;

  filter: drop-shadow(0 40px 100px rgba(0, 0, 0, 0.15));

  &::-webkit-scrollbar {
    display: none;
  }

  &::-webkit-scrollbar-track {
    background: none;
  }

  &::-webkit-scrollbar-thumb {
    background: none;
  }

  ${up.mobileLandscape} {
    padding: 80px 40px 53px;
  }

  ${up.tablet} {
    padding: 77px 80px 53px;
  }

  ${up.desktop} {
    padding: 77px 80px 100px;
  }
`;

const Container = styled.div`
  display: flex;
  padding-right: 50px;
`;

const SlideImage = styled.div`
  width: 295px;
  height: 188px;

  background-repeat: no-repeat;
  background-position: center;
  background-size: 295px 188px;

  &.one {
    background-image: url('./screen-1-mobile.png');

    ${up.mobileLandscape} {
      width: 488px;
      height: 312px;

      background-image: url('./screen-1-mobile-landscape.png');
    }

    ${up.tablet} {
      width: 865px;
      height: 556px;

      background-image: url('./screen-1-tablet.png');
      background-size: 865px 556px;
    }

    ${up.desktop} {
      width: 1136px;
      height: 730px;

      background-image: url('./screen-1-desktop.png');
      background-size: 1136px 730px;
    }
  }

  &:not(:last-child) {
    margin-right: 16px;
  }

  ${up.mobileLandscape} {
    width: 488px;
    height: 312px;

    background-size: 488px 312px;

    &:not(:last-child) {
      margin-right: 20px;
    }
  }

  ${up.tablet} {
    width: 865px;
    height: 556px;

    background-size: 865px 556px;

    /*
    &:not(:last-child) {
      margin-right: 0;
    }
     */
  }
`;

const Bottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 40px;
`;

const Hint = styled.div`
  margin-top: 24px;

  color: #161616;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 140%;

  opacity: 0.3;

  ${up.tablet} {
    margin-top: 20px;

    font-size: 14px;
  }
`;

export const Under: FC = () => {
  return (
    <Wrapper>
      <Top>
        <Title>
          A sneak peek of what we have <Bold>under the hood</Bold>
        </Title>
      </Top>
      <Middle>
        <Container>
          <SlideImage className="one" />
          <SlideImage className="one" />
          <SlideImage className="one" />
        </Container>
      </Middle>
      <Bottom>
        <ButtonIOS onClick={() => trackEvent('landing_download_for_ios_3_click')} />
        <Hint>Will take less than a 2 min.</Hint>
      </Bottom>
    </Wrapper>
  );
};
