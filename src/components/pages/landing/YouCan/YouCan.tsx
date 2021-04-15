import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { up, useBreakpoint } from '../styles/breakpoints';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  background-image: url('./bg-mobile.png');
  background-repeat: no-repeat;
  background-size: contain;

  ${up.mobileLandscape} {
    background-image: url('./bg-mobile-landscape.png');
    background-size: cover;
  }

  ${up.tablet} {
    background-image: url('./bg-tablet.png');
    background-size: contain;
  }

  ${up.desktop} {
    background-image: url('./bg-desktop.png');
  }
`;

const Top = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px 0 96px;

  ${up.mobileLandscape} {
    padding: 100px 0 110px;
  }

  ${up.tablet} {
    padding: 120px 0 70px;
  }

  ${up.desktop} {
    padding: 168px 0 90px;
  }
`;

const Title = styled.div`
  max-width: 295px;

  color: #161616;
  font-weight: 900;
  font-size: 40px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 50px;
  text-align: center;

  ${up.mobileLandscape} {
    max-width: 488px;

    font-size: 48px;
    line-height: 56px;
  }

  ${up.tablet} {
    max-width: 864px;

    font-size: 48px;
    line-height: 56px;
  }

  ${up.desktop} {
    max-width: 1068px;

    font-size: 60px;
    line-height: 64px;
  }
`;

const Hint = styled.div`
  position: relative;

  max-width: 296px;
  margin-top: 95px;

  color: #161616;
  font-size: 20px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
  text-align: center;

  &::after {
    position: absolute;

    top: -55px;
    left: -30px;

    width: 352px;
    height: 170px;

    background: url('./circle.png') no-repeat 50%;
    background-size: 352px 170px;

    content: '';
  }

  ${up.mobileLandscape} {
    max-width: initial;

    margin-top: 101px;

    line-height: 44px;

    &::after {
      top: -73px;
      left: -60px;

      width: 516px;
      height: 184px;

      background-size: 516px 184px;
    }
  }

  ${up.tablet} {
    margin-top: 105px;

    font-size: 20px;
    line-height: 44px;

    &::after {
      width: 516px;
      height: 184px;

      background-size: 516px 184px;
    }
  }

  ${up.desktop} {
    margin-top: 120px;

    font-size: 24px;
    line-height: 44px;

    &::after {
      top: -98px;
      left: -50px;

      width: 592px;
      height: 211px;

      background-size: 592px 211px;
    }
  }
`;

const TitleBold = styled.span`
  font-weight: 700;
`;

const Middle = styled.div`
  display: flex;
  flex-direction: column;

  background: #f9f9f9;

  ${up.tablet} {
    flex-direction: row;
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 40px;

  ${up.mobileLandscape} {
    align-items: center;
    padding: 0 56px;
  }

  ${up.tablet} {
    padding: 0 0 0 80px;
  }

  ${up.desktop} {
    flex: 1;

    padding-left: 118px;
  }
`;

const TextContent = styled.div`
  ${up.mobileLandscape} {
    max-width: 456px;
  }

  ${up.desktop} {
    max-width: 450px;
  }
`;

const TextTitle = styled.div`
  color: #161616;
  font-size: 40px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 40px;

  ${up.mobileLandscape} {
    font-size: 36px;
  }

  ${up.desktop} {
    font-size: 48px;
    line-height: 50px;
  }
`;

const TextTitleBold = styled.span`
  font-weight: 900;
`;

const Text = styled.div`
  margin-top: 48px;

  color: #161616;
  font-size: 18px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 32px;

  ${up.mobileLandscape} {
    font-size: 24px;
    line-height: 32px;
  }

  ${up.tablet} {
    font-size: 20px;
    line-height: 30px;
  }

  ${up.desktop} {
    margin-top: 50px;

    font-size: 24px;
    line-height: 34px;
  }
`;

const TextBold = styled.span`
  color: #50d5ff;
  font-weight: 900;
`;

const LearnMoreLink = styled.a`
  display: flex;
  align-items: center;
  margin-top: 48px;

  color: #161616;
  font-weight: 500;
  font-size: 18px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 34px;

  ${up.mobileLandscape} {
    font-size: 24px;
    text-decoration: none;
  }

  ${up.tablet} {
    margin-top: 40px;

    font-size: 20px;
  }

  ${up.desktop} {
    margin-top: 56px;

    font-size: 24px;
  }
`;

const Arrow = styled.div`
  width: 13px;
  height: 16px;
  margin-left: 23px;

  background: url('./arrow.png') no-repeat 50%;
  background-size: 13px 16px;
`;

const Window = styled.div`
  width: 100%;
  height: 453px;
  margin-top: 121px;

  background-image: url('./window-mobile.png');
  background-repeat: no-repeat;
  background-position: 100% 50%;
  background-size: 345px 453px;

  ${up.mobileLandscape} {
    height: 668px;

    background-image: url('./window-mobile-landscape.png');
    background-size: 508px 668px;
  }

  ${up.tablet} {
    flex: 1;
    height: 668px;

    background-image: url('./window-tablet.png');
    background-size: 454px 668px;
  }

  ${up.desktop} {
    flex: initial;
    width: 846px;
    height: 873px;

    background-image: url('./window-desktop.png');
    background-size: 846px 873px;
  }
`;

const Bottom = styled.div`
  background: #f9f9f9;
`;

type Props = {
  children: React.ReactNode;
};

export const YouCan: FC<Props> = ({ children }) => {
  const isDesktop = useBreakpoint(up.desktop);
  const isMobileLandscape = useBreakpoint(up.mobileLandscape);

  return (
    <Wrapper>
      <Top>
        <Title>Imagine if you can send USD, BTC or ETH without fees in few seconds?</Title>
        <Hint>
          We have it! <TitleBold>BTC</TitleBold>, <TitleBold>ETH</TitleBold> and{' '}
          <TitleBold>30+</TitleBold> another tokens*
        </Hint>
      </Top>
      <Middle>
        <TextWrapper>
          <TextContent>
            <TextTitle>
              You can send fast and with no fees a <TextTitleBold>lot of tokens</TextTitleBold>
            </TextTitle>
            <Text>
              Doesn’t matter what token you want to send. {!isDesktop ? <br /> : undefined}
              <TextBold>The speed is stable for all of them!</TextBold>
              <br />
              <br />
              Solana blokchain contains many tokens. Its native and wrapped by different
              technologies. Such as FTX, Sollet etc. It’s allows us to keep the speed and no-fees in
              front of all.
            </Text>
            <LearnMoreLink>
              Learn more about Wrapped Tokens {isMobileLandscape ? <Arrow /> : undefined}
            </LearnMoreLink>
          </TextContent>
        </TextWrapper>
        <Window />
      </Middle>
      <Bottom>{children}</Bottom>
    </Wrapper>
  );
};
