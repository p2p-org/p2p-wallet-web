import type { FC } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';

import { up, useBreakpoint } from '../styles/breakpoints';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  background-image: url('./bg-youcan.svg');
  background-repeat: no-repeat;
  background-position: 50% 0;
  background-size: 101% 25%;
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

    background: url('./circle.svg') no-repeat 50%;
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
  justify-content: center;

  background: #f9f9f9;
`;

const MiddleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 40px;

  ${up.mobileLandscape} {
    padding: 0 56px;
  }

  ${up.tablet} {
    flex-direction: row;
    max-width: 864px;
    padding: 0;
  }

  ${up.desktop} {
    max-width: 1204px;
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 456px;

  ${up.mobileLandscape} {
    align-items: center;
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

// const LearnMoreLink = styled.a`
//   display: flex;
//   align-items: center;
//   margin-top: 48px;
//
//   color: #161616;
//   font-weight: 500;
//   font-size: 18px;
//   font-family: 'Aktiv Grotesk Corp', sans-serif;
//   line-height: 34px;
//
//   ${up.mobileLandscape} {
//     font-size: 24px;
//     text-decoration: none;
//   }
//
//   ${up.tablet} {
//     margin-top: 40px;
//
//     font-size: 20px;
//   }
//
//   ${up.desktop} {
//     margin-top: 56px;
//
//     font-size: 24px;
//   }
// `;
//
// const Arrow = styled.div`
//   width: 13px;
//   height: 16px;
//   margin-left: 23px;
//
//   background: url('./arrow.svg') no-repeat 50%;
//   background-size: 13px 16px;
// `;

const Window = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  width: 100%;
  height: 453px;
  margin-top: 121px;

  &::before {
    position: absolute;

    width: 802px;
    height: 453px;

    background-image: url('./ellipse-youcan.svg');
    background-repeat: no-repeat;
    background-position: 100% 50%;
    background-size: 802px 453px;

    content: '';
  }

  &::after {
    position: absolute;
    left: 65px;

    width: 526px;
    height: 431px;

    background-image: url('./window-youcan.svg');
    background-repeat: no-repeat;
    background-position: 100% 50%;
    background-size: 552px 431px;
    filter: drop-shadow(-34px 42px 100px rgba(0, 0, 0, 0.15));

    content: '';
  }

  ${up.mobileLandscape} {
    height: 668px;

    &::before {
      width: 1183px;
      height: 668px;

      background-size: 1183px 668px;
    }

    &::after {
      left: 30px;

      width: 913px;
      height: 714px;

      background-size: 913px 714px;
    }
  }

  ${up.tablet} {
    flex: 1;
    margin-top: 0;
    margin-left: 34px;
  }

  ${up.desktop} {
    flex: initial;
    width: 846px;
    height: 873px;
    margin-left: 20px;

    &::before {
      width: 1426px;
      height: 873px;

      background-size: 1426px 873px;
    }

    &::after {
      left: 90px;

      width: 796px;
      height: 836px;

      background-size: 796px 836px;
    }
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
  // const isMobileLandscape = useBreakpoint(up.mobileLandscape);

  return (
    <Wrapper>
      <Top>
        <Title>Imagine if you can send USD, BTC or ETH without fees in just a few seconds?</Title>
        <Hint>
          We have it! <TitleBold>BTC</TitleBold>, <TitleBold>ETH</TitleBold> and{' '}
          <TitleBold>30+</TitleBold> another tokens*
        </Hint>
      </Top>
      <Middle>
        <MiddleContainer>
          <TextWrapper>
            <TextContent>
              <TextTitle>
                You can send a <TextTitleBold>lot of tokens</TextTitleBold> fast and with no fees
              </TextTitle>
              <Text>
                Doesn’t matter what token you want to send. {!isDesktop ? <br /> : undefined}
                <TextBold>The speed is stable for all of them!</TextBold>
                <br />
                <br />
                Solana blockchain contains many tokens. It’s native and wrapped by different
                technologies such as FTX, Sollet etc. It allows us to keep the speed and no-fees in
                front of others.
              </Text>
              {/* <LearnMoreLink> */}
              {/*  Learn more about Wrapped Tokens {isMobileLandscape ? <Arrow /> : undefined} */}
              {/* </LearnMoreLink> */}
            </TextContent>
          </TextWrapper>
          <Window />
        </MiddleContainer>
      </Middle>
      <Bottom>{children}</Bottom>
    </Wrapper>
  );
};
