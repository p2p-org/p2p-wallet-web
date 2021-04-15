import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { down, up, useBreakpoint } from '../styles/breakpoints';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  height: 1600px;

  &::before {
    position: absolute;
    top: -30px;
    left: 0;

    width: 100%;
    height: 1923px;

    background: url('./bg-mobile.png') no-repeat 50% 50%;
    background-size: 100% 2027px;

    content: '';
  }

  ${down.mobileLandscape} {
    &::after {
      position: absolute;

      top: 60px;
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
    height: 1488px;

    &::before {
      top: -150px;

      width: 100%;
      height: 1923px;

      background: url('./bg-mobile-landscape.png') no-repeat 50% 50%;
      background-size: 100% 1923px;
    }
  }

  ${up.tablet} {
    height: 1284px;

    &::before {
      width: 100%;
      height: 1791px;

      background: url('./bg-tablet.png') no-repeat 50% 50%;
      background-size: 100% 1791px;
    }
  }

  ${up.desktop} {
    height: 960px;

    &::before {
      width: 100%;
      height: 1474px;

      background: url('./bg-desktop.png') no-repeat 50% 50%;
      background-size: 100% 1474px;
    }
  }
`;

const HackathonWrapper = styled.div`
  position: absolute;

  ${up.tablet} {
    top: 85px;
    right: 33px;

    width: 305px;
    height: 159px;

    &::before {
      position: absolute;

      top: 0;
      left: 0;

      width: 128px;
      height: 128px;

      background: url('./hackathon-second.png') no-repeat 50% 50%;
      background-size: 128px;

      content: '';
    }

    &::after {
      position: absolute;

      right: 0;
      bottom: 0;

      width: 128px;
      height: 128px;

      background: url('./hackathon-third.png') no-repeat 50% 50%;
      background-size: 128px;

      content: '';
    }
  }

  ${up.desktop} {
    top: 0;
    right: 70px;

    width: 300px;
    height: 150px;

    &::before {
      bottom: 0;
      left: 0;
    }

    &::after {
      top: 0;
      right: 0;
    }
  }
`;

const Container = styled.div`
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 130px;

  ${up.mobileLandscape} {
    margin-top: 140px;
  }

  ${up.tablet} {
    margin-top: 180px;
  }

  ${up.desktop} {
    flex-direction: row;
    margin-top: 50px;
  }
`;

const CarouselWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;

  ${up.tablet} {
    flex-direction: row;
  }
`;

const Carousel = styled.div`
  position: relative;

  width: 351px;
  height: 545px;
`;

const Selectors = styled.div`
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
    background-image: url('./selector-send.png');
    background-size: 16px 13px;
  }

  &.receive {
    background-image: url('./selector-receive.png');
    background-size: 16px 13px;
  }

  &.swap {
    background-image: url('./selector-swap.png');
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
    background: url('./selector-bg.png') no-repeat 50% 50%;
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
      margin-top: 50px;
      margin-right: 0;
    }
  }

  ${up.desktop} {
    &:not(:last-child) {
      margin-top: 40px;
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

  width: 263px;
  height: 527px;

  background-repeat: no-repeat;
  background-position: center;

  &.one {
    top: 0;
    right: 0;
    z-index: 1;

    background-image: url('./screen-1-desktop.png');
    background-size: 263px 527px;
  }

  &.two {
    bottom: 0;
    left: 0;

    width: 208px;
    height: 452px;

    background-image: url('./screen-1-desktop.png');
    background-size: 208px 452px;

    transform: rotate(-10deg);
  }
`;

const TextWrapper = styled.div`
  z-index: 1;

  flex: 1;

  margin-top: 71px;
  padding: 0 40px;

  ${up.mobileLandscape} {
    margin-top: 80px;
  }

  ${up.tablet} {
    margin-top: 100px;
  }

  ${up.desktop} {
    margin-left: 288px;
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

  return (
    <Wrapper>
      {isTablet ? <HackathonWrapper /> : undefined}
      <Container>
        <CarouselWrapper>
          <Carousel>
            <SlideImage className="one" />
            <SlideImage className="two" />
          </Carousel>
          <Selectors>
            <Selector className="active">
              <Icon className="send" />
              <SelectorName>Send</SelectorName>
            </Selector>
            <Selector>
              <Icon className="receive" />
              <SelectorName>Receive</SelectorName>
            </Selector>
            <Selector>
              <Icon className="swap" />
              <SelectorName>Swap</SelectorName>
            </Selector>
          </Selectors>
        </CarouselWrapper>
        <TextWrapper>
          <TextContent>
            <Title>
              Send <TitleBold>USDC</TitleBold>, <TitleBold>BTC</TitleBold>,{' '}
              <TitleBold>ETH</TitleBold>, and other tokens <TitleBold>in a seconds</TitleBold> with{' '}
              <TitleBold>no fees</TitleBold>. By QR code, address or username right in your app or
              web wallet.
            </Title>
            <Description>
              Solana has 400ms blocks and extremely low fees by design. Every transaction takes less
              than a minute. We took all fees on us.
            </Description>
          </TextContent>
        </TextWrapper>
      </Container>
    </Wrapper>
  );
};
