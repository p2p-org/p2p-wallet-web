import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { down, up, useBreakpoint } from '../styles/breakpoints';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  justify-content: center;

  height: 1389px;
  margin-top: 187px;

  ${down.mobileLandscape} {
    &::after {
      position: absolute;

      top: -100px;
      left: 50%;

      width: 30px;
      height: 30px;
      margin-left: -15px;

      background: url('./arrow-down-mobile.png') no-repeat 50%;
      background-size: 30px;

      content: '';
    }
  }

  ${up.mobileLandscape} {
    height: 1348px;
    margin-top: 130px;
  }

  ${up.tablet} {
    height: 1177px;
    margin-top: 119px;
  }

  ${up.desktop} {
    height: 854px;
    margin-top: 110px;
  }
`;

const HackathonWrapper = styled.div`
  position: absolute;
  z-index: 1;

  ${up.tablet} {
    top: -40px;
    right: -161px;

    width: 305px;
    height: 159px;

    &::before {
      position: absolute;

      top: 0;
      left: 0;

      width: 128px;
      height: 128px;

      background: url('./hackathon-second.svg') no-repeat 50% 50%;

      content: '';
    }

    &::after {
      position: absolute;

      right: 0;
      bottom: 0;

      width: 128px;
      height: 128px;

      background: url('./hackathon-third.svg') no-repeat 50% 50%;

      content: '';
    }
  }

  ${up.desktop} {
    top: -110px;
    right: -48px;

    width: 300px;
    height: 150px;

    &::before {
      top: initial;
      bottom: 0;
      left: 0;
    }

    &::after {
      top: 0;
      right: 0;
      bottom: initial;
    }
  }
`;

const Container = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1178px;

  &::before {
    position: absolute;
    top: -291px;

    width: 1896px;
    height: 2027px;

    background: url('./gradient.png') no-repeat 50%;
    background-size: 1896px 2027px;

    content: '';
  }

  &::after {
    position: absolute;
    top: 0;

    width: 926px;
    height: 1389px;

    background: url('./ellipse-functions.svg') no-repeat 50%;
    background-size: 926px 1389px;

    content: '';
  }

  ${up.mobileLandscape} {
    &::before {
      width: 1798px;
      height: 1923px;

      background-size: 1798px 1923px;
    }

    &::after {
      width: 1250px;
      height: 1348px;

      background-size: 1250px 1348px;
    }
  }

  ${up.tablet} {
    &::before {
      top: -259px;

      width: 1674px;
      height: 1791px;

      background-size: 1674px 1791px;
    }

    &::after {
      width: 1250px;
      height: 1177px;

      background-size: 1250px 1177px;
    }
  }

  ${up.desktop} {
    flex-direction: row;

    &::before {
      top: -257px;

      display: none;

      width: 1506px;
      height: 1311px;

      background-size: 1506px 1311px;
    }

    &::after {
      display: none;

      width: 1458px;
      height: 854px;

      background-size: 1458px 854px;
    }
  }
`;

const Curves = styled.div`
  position: absolute;
  bottom: -151px;
  left: -1021px;

  width: 3204px;
  height: 1647px;

  background: url('./curves-functions.svg') no-repeat 50%;
  background-size: 3204px 1647px;

  content: '';

  ${up.mobileLandscape} {
    bottom: -78px;
    left: -685px;

    width: 2959px;
    height: 1521px;

    background-size: 2959px 1521px;
  }

  ${up.tablet} {
    bottom: 18px;
    left: -295px;

    width: 2759px;
    height: 1418px;

    background-size: 2759px 1418px;
  }

  ${up.desktop} {
    bottom: -363px;
    left: -144px;

    width: 2759px;
    height: 1418px;

    background-size: 2759px 1418px;
  }
`;

const CarouselWrapper = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 854px;

  ${up.tablet} {
    flex-direction: row;
    height: 545px;
  }

  ${up.desktop} {
    padding-right: 94px;

    &::before {
      position: absolute;
      right: -298px;

      width: 1506px;
      height: 1311px;

      background: url('./gradient.png') no-repeat 50%;
      background-size: 1506px 1311px;

      content: '';
    }

    &::after {
      position: absolute;

      right: 0;

      width: 1458px;
      height: 854px;

      background: url('./ellipse-functions.svg') no-repeat 50%;
      background-size: 1458px 854px;

      content: '';
    }
  }

  ${up.widedesktop} {
    &::after {
      background-position: 100% 50%;
      background-size: 854px 854px;
    }
  }
`;

const Carousel = styled.div`
  position: relative;
  z-index: 1;

  width: 286px;
  height: 504px;
`;

const Selectors = styled.div`
  z-index: 1;

  display: flex;

  margin-top: 71px;

  ${up.mobileLandscape} {
    margin-top: 90px;
  }

  ${up.tablet} {
    flex-direction: column;
    margin-top: 0;
    margin-left: 100px;
  }
`;

const Icon = styled.div`
  width: 48px;
  height: 48px;

  background-color: rgba(255, 255, 255, 0.05);
  background-repeat: no-repeat;
  background-position: 50%;
  border-radius: 18px;

  &.send {
    background-image: url('./selector-send.svg');
    background-size: 16px 13px;
  }

  &.store {
    background-image: url('./selector-store.svg');
    background-size: 16px 16px;
  }

  &.swap {
    background-image: url('./selector-swap.svg');
    background-size: 28px 28px;
  }
`;

const Selector = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  cursor: pointer;

  &.active,
  &:hover {
    background: url('./selector-bg.svg') no-repeat 50% 50%;
    background-size: contain;

    ${Icon} {
      background-color: #fff;
    }
  }

  &:not(:last-child) {
    margin-right: 20px;
  }

  ${up.mobileLandscape} {
    &:not(:last-child) {
      margin-right: 32px;
    }
  }

  ${up.tablet} {
    &:not(:last-child) {
      margin-right: 0;
      margin-bottom: 20px;
    }
  }
`;

const SelectorName = styled.div`
  margin-top: 12px;

  color: #fff;
  font-weight: bold;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 140%;
  white-space: nowrap;
  text-align: center;
`;

const SlideImage = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  background-repeat: no-repeat;
  background-position: center;

  transition: top 0.2s, bottom 0.2s, right 0.2s, left 0.2s;

  &:first-child {
    top: 0;
    right: 0;
    z-index: 1;

    width: 232px;
    height: 502px;

    background-size: 232px 502px;
    filter: drop-shadow(0 32px 56px rgba(0, 0, 0, 0.5));
  }

  &:nth-child(2) {
    top: initial;
    bottom: 0;
    left: 0;

    width: 208px;
    height: 452px;

    background-size: 208px 452px;
    transform: rotate(-10deg);
  }

  &.send {
    background-image: url('./screen-1-desktop.png');
  }

  &.store {
    background-image: url('./screen-2-desktop.png');
  }

  &.swap {
    background-image: url('./screen-3-desktop.png');
  }
`;

const TextWrapper = styled.div`
  z-index: 1;

  margin-top: 71px;
  padding: 0 40px;

  ${up.mobileLandscape} {
    margin-top: 80px;
  }

  ${up.tablet} {
    margin-top: 100px;
  }

  ${up.desktop} {
    min-height: 419px;
    margin-top: 0;
    margin-left: 88px;
    padding: 0;
  }
`;

const TextContent = styled.div`
  max-width: 456px;
`;

const Title = styled.div`
  color: #f9f9f9;
  font-size: 24px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 32px;

  ${up.desktop} {
    font-size: 32px;
    line-height: 48px;
  }
`;

const TitleBold = styled.span`
  font-weight: 900;
  font-family: 'GT Super Ds Trial', sans-serif;
`;

const Description = styled.div`
  margin-top: 32px;

  color: #f9f9f9;
  font-size: 20px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 30px;

  opacity: 0.3;

  ${up.desktop} {
    font-size: 24px;
    line-height: 36px;
  }
`;

export const Functions: FC = () => {
  const isTablet = useBreakpoint(up.tablet);
  const [activeSlide, setActiveSlide] = useState('send');
  const [slides, setSlides] = useState(['send', 'store', 'swap']);

  const handleClick = (nextSlide: string) => () => {
    const newSlides = slides.filter((slide) => slide !== nextSlide);
    setActiveSlide(nextSlide);
    setSlides([nextSlide, ...newSlides]);
  };

  return (
    <Wrapper>
      <Container>
        <Curves />
        {isTablet ? <HackathonWrapper /> : undefined}
        <CarouselWrapper>
          <Carousel>
            {slides.map((slide) => (
              <SlideImage key={slide} className={slide} />
            ))}
          </Carousel>
          <Selectors>
            <Selector
              className={classNames({ active: activeSlide === 'send' })}
              onClick={handleClick('send')}
            >
              <Icon className="send" />
              <SelectorName>Send</SelectorName>
            </Selector>
            <Selector
              className={classNames({ active: activeSlide === 'store' })}
              onClick={handleClick('store')}
            >
              <Icon className="store" />
              <SelectorName>Store</SelectorName>
            </Selector>
            <Selector
              className={classNames({ active: activeSlide === 'swap' })}
              onClick={handleClick('swap')}
            >
              <Icon className="swap" />
              <SelectorName>Swap</SelectorName>
            </Selector>
          </Selectors>
        </CarouselWrapper>
        <TextWrapper>
          {activeSlide === 'send' ? (
            <TextContent>
              <Title>
                Send <TitleBold>USDC</TitleBold>, <TitleBold>BTC</TitleBold>,{' '}
                <TitleBold>ETH</TitleBold>, and other tokens <TitleBold>in a seconds</TitleBold>{' '}
                with <TitleBold>no fees</TitleBold>. Use QR code or address right in your app or web
                wallet.
              </Title>
              <Description>
                Solana has 400ms blocks and extremely low fees by design. Every transaction takes
                less than a minute. All the fees are on us.
              </Description>
            </TextContent>
          ) : undefined}
          {activeSlide === 'store' ? (
            <TextContent>
              <Title>
                Full control of your cryptos and your keys.{' '}
                <TitleBold>Only you can access your assets.</TitleBold> <br /> Not government. Not
                us. Not anyone else. Easily manage 30+ coins.
              </Title>
              <Description>
                Easily import your existing wallet with a 12/24-word recovery phrase.
              </Description>
            </TextContent>
          ) : undefined}
          {activeSlide === 'swap' ? (
            <TextContent>
              <Title>
                Exchange crypto using the advantages of DeFi Solutions with a{' '}
                <TitleBold>high speed</TitleBold> of centralized exchanges.{' '}
                <TitleBold>No signup required.</TitleBold> Exchange in a few seconds. Sophisticated
                UI/UX.
              </Title>
            </TextContent>
          ) : undefined}
        </TextWrapper>
      </Container>
    </Wrapper>
  );
};
