import type { FC } from 'react';

import { styled } from '@linaria/react';

import LogoImg from 'assets/images/big-logo.png';
import { ButtonIOS, ButtonWeb } from 'components/pages/landing/common/Button/Button';
import { trackEvent } from 'utils/analytics';

import { up } from '../styles/breakpoints';
import LogoP2PImg from './logo.png';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  justify-content: center;

  background-image: url('./ellipse.svg');
  background-repeat: no-repeat;
  background-position: 50% 0;
  background-size: 101% 100%;
`;

const FooterWrapper = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
`;

const Top = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 40px 80px;

  ${up.mobileLandscape} {
    padding: 80px 40px;
  }

  ${up.tablet} {
    padding: 80px 40px 72px;
  }

  ${up.desktop} {
    padding: 55px 40px 80px;
  }
`;

const Logo = styled.div`
  width: 64px;
  height: 64px;

  background: url('${LogoImg}') no-repeat 50% 50%;
  background-size: 64px 64px;
`;

const Title = styled.div`
  margin-top: 56px;

  color: #f9f9f9;
  font-weight: 900;
  font-size: 32px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 36px;
  text-align: center;

  ${up.mobileLandscape} {
    max-width: 488px;
    margin-top: 80px;

    font-size: 44px;
    line-height: 56px;
  }

  ${up.tablet} {
    max-width: 886px;
    margin-top: 64px;

    font-size: 48px;
    line-height: 56px;
  }

  ${up.desktop} {
    max-width: 1067px;
    margin-top: 56px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 56px;

  & > :not(:last-child) {
    margin-bottom: 20px;
  }

  ${up.mobileLandscape} {
    margin-top: 80px;

    & > * {
      width: 388px;
    }
  }

  ${up.tablet} {
    flex-direction: row;
    margin-top: 64px;

    & > * {
      width: inherit;
      margin-bottom: 0 !important;
    }

    & > :not(:last-child) {
      margin-right: 20px;
    }
  }
`;

const BackgroundBlack = styled.div`
  width: 100%;

  /* TODO: need to be here */
  background: #161616;
`;

const DelimiterSection = styled.div`
  width: 100%;
  height: 1px;

  background: #2d2d2d;
`;

const Middle = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const MiddleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 50px;

  ${up.mobileLandscape} {
    padding: 56px 103px 78px;
  }

  ${up.tablet} {
    flex-direction: row;
    align-items: initial;
    padding: 80px 88px;
  }

  ${up.desktop} {
    max-width: 1442px;
    padding: 68px 47px;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 34px;

  // ${up.tablet} {
  //   margin-right: 146px;
  // }
  //
  // ${up.desktop} {
  //   margin-right: 264px;
  // }
`;

const LogoP2P = styled.div`
  width: 80px;
  height: 18px;

  background: url('${LogoP2PImg}') no-repeat 50% 50%;
  background-size: 80px 18px;
`;

const DelimiterLogo = styled.div`
  width: 1px;
  height: 34px;
  margin: 0 24px 0 31px;

  background: rgba(255, 255, 255, 0.2);
`;

const Wallet = styled.div`
  color: #fff;
  font-weight: bold;
  font-size: 24px;
  font-family: 'GT Super Txt Trial', sans-serif;
  line-height: 140%;
`;

// const ColumnsWrapper = styled.div`
//   display: flex;
//   margin-top: 56px;
//
//   ${up.mobileLandscape} {
//     flex-direction: column;
//     align-items: center;
//
//     margin-top: 20px;
//   }
//
//   ${up.tablet} {
//     flex-direction: row;
//     align-items: initial;
//
//     margin-top: 0;
//   }
// `;
//
// const Column = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//
//   & > :not(:last-child) {
//     margin-bottom: 30px;
//   }
//
//   ${up.mobileLandscape} {
//     margin-top: 100px;
//   }
//
//   ${up.tablet} {
//     align-items: initial;
//
//     margin-top: 0;
//
//     &:not(:last-child) {
//       margin-right: 143px;
//     }
//   }
// `;

// const AdditionalColumn = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   width: 100%;
//   padding: 39px 0;
//
//   & > :not(:last-child) {
//     margin-bottom: 30px;
//   }
//
//   ${up.mobileLandscape} {
//     padding: 61px 0;
//
//     & > :not(:last-child) {
//       margin-bottom: 43px;
//     }
//   }
// `;

// const ColumnLink = styled.a`
//   display: flex;
//   align-items: center;
//   height: 22px;
//
//   color: #fff;
//   font-weight: 500;
//   font-size: 20px;
//   font-family: 'Aktiv Grotesk Corp', sans-serif;
//   line-height: 140%;
//   text-decoration: none;
//
//   ${up.mobileLandscape} {
//     font-size: 24px;
//     line-height: 140%;
//   }
//
//   ${up.tablet} {
//     font-size: 16px;
//     line-height: 140%;
//   }
//
//   &.gray {
//     color: rgba(255, 255, 255, 0.3);
//   }
//
//   &.twitter {
//     height: 34px;
//     padding-left: 40px;
//
//     background: url('./twitter.png') no-repeat 0 50%;
//     background-size: 24px;
//   }
//
//   &.github {
//     height: 34px;
//     padding-left: 40px;
//
//     background: url('./github.png') no-repeat 0 50%;
//     background-size: 24px;
//   }
// `;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 32px 40px;

  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
  font-family: 'Aktiv Grotesk Corp', sans-serif;

  ${up.mobileLandscape} {
    padding: 25px 40px;

    font-size: 20px;
    line-height: 140%;
  }

  ${up.tablet} {
    padding: 20px 40px;

    font-size: 16px;
    line-height: 140%;
  }

  ${up.desktop} {
    padding: 15px 40px;
  }
`;

export const Footer: FC = () => {
  return (
    <Wrapper>
      <FooterWrapper>
        <Top>
          <Logo />
          <Title>Carefully crafted for people from people in and around the world</Title>
          <ButtonWrapper>
            <ButtonWeb glow onClick={() => trackEvent('landing_go_to_web_wallet_3_click')} />
            <ButtonIOS glow onClick={() => trackEvent('landing_download_for_ios_4_click')} />
          </ButtonWrapper>
        </Top>
        <BackgroundBlack>
          <DelimiterSection />
          <Middle>
            <MiddleContainer>
              <LogoWrapper>
                <LogoP2P />
                <DelimiterLogo />
                <Wallet>Wallet</Wallet>
              </LogoWrapper>
              {/* <ColumnsWrapper> */}
              {/* <Column> */}
              {/*  <ColumnLink href="#">Explore</ColumnLink> */}
              {/*  <ColumnLink href="#">About</ColumnLink> */}
              {/*  <ColumnLink href="#">Recent Updates</ColumnLink> */}
              {/*  <ColumnLink href="#">FAQ</ColumnLink> */}
              {/* </Column> */}
              {/* {isDesktop ? ( */}
              {/*  <Column> */}
              {/*    <ColumnLink href="#" className="gray"> */}
              {/*      wallet@p2p.org */}
              {/*    </ColumnLink> */}
              {/*    <ColumnLink href="#" className="gray"> */}
              {/*      t.me/p2p.org */}
              {/*    </ColumnLink> */}
              {/*  </Column> */}
              {/* ) : undefined} */}
              {/* {isMobileLandscape ? ( */}
              {/*  <Column> */}
              {/*    <ColumnLink href="#" className="gray twitter"> */}
              {/*      @p2pwallet */}
              {/*    </ColumnLink> */}
              {/*    <ColumnLink href="#" className="gray github"> */}
              {/*      @p2pwallet */}
              {/*    </ColumnLink> */}
              {/*    {!isDesktop && isTablet ? ( */}
              {/*      <> */}
              {/*        <ColumnLink href="#" className="gray"> */}
              {/*          wallet@p2p.org */}
              {/*        </ColumnLink> */}
              {/*        <ColumnLink href="#" className="gray"> */}
              {/*          t.me/p2p.org */}
              {/*        </ColumnLink> */}
              {/*      </> */}
              {/*    ) : undefined} */}
              {/*  </Column> */}
              {/* ) : undefined} */}
              {/* </ColumnsWrapper> */}
            </MiddleContainer>
          </Middle>
          {/* {!isMobileLandscape ? ( */}
          {/*  <> */}
          {/*    <DelimiterSection /> */}
          {/*    <AdditionalColumn> */}
          {/*      <ColumnLink href="#" className="gray twitter"> */}
          {/*        @p2pwallet */}
          {/*      </ColumnLink> */}
          {/*      <ColumnLink href="#" className="gray github"> */}
          {/*        @p2pwallet */}
          {/*      </ColumnLink> */}
          {/*    </AdditionalColumn> */}
          {/*  </> */}
          {/* ) : undefined} */}
          {/* {!isTablet ? ( */}
          {/*  <> */}
          {/*    <DelimiterSection /> */}
          {/*    <AdditionalColumn> */}
          {/*      <ColumnLink href="#" className="gray"> */}
          {/*        wallet@p2p.org */}
          {/*      </ColumnLink> */}
          {/*      <ColumnLink href="#" className="gray"> */}
          {/*        t.me/p2p.org */}
          {/*      </ColumnLink> */}
          {/*    </AdditionalColumn> */}
          {/*  </> */}
          {/* ) : undefined} */}
          <DelimiterSection />
          <Bottom>
            There shoud be something about privacy policy and terms of services, but you can use it
            anonymously
          </Bottom>
        </BackgroundBlack>
      </FooterWrapper>
    </Wrapper>
  );
};
