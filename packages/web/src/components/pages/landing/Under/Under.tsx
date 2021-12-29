import type { FC } from 'react';

import { styled } from '@linaria/react';

import { ButtonIOS, ButtonWeb } from 'components/pages/landing/common/Button/Button';
import { CarouselMobile } from 'components/pages/landing/Under/CarouselMobile';
import { trackEvent } from 'utils/analytics';

import { up, useBreakpoint } from '../styles/breakpoints';
import { CarouselDesktop } from './CarouselDesktop';

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

const CarouselWrapper = styled.div`
  padding: 64px 0;

  ${up.mobileLandscape} {
    padding: 80px 0 53px;
  }

  ${up.tablet} {
    display: flex;
    justify-content: center;
    padding: 77px 0 80px;
  }

  ${up.desktop} {
    padding: 77px 0 100px;
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
  const isTablet = useBreakpoint(up.tablet);

  return (
    <Wrapper>
      <Top>
        <Title>
          Here’s a sneak peek of what we have <Bold>under the hood</Bold>
        </Title>
      </Top>
      <CarouselWrapper>{isTablet ? <CarouselDesktop /> : <CarouselMobile />}</CarouselWrapper>
      <Bottom>
        {isTablet ? (
          <ButtonWeb green />
        ) : (
          <ButtonIOS onClick={() => trackEvent('landing_download_for_ios_3_click')} />
        )}
        <Hint>Will take less than a 2 min.</Hint>
      </Bottom>
    </Wrapper>
  );
};
