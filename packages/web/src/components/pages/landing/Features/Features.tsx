import type { FC } from 'react';

import { styled } from '@linaria/react';

import { ButtonIOS, ButtonWeb } from 'components/pages/landing/common/Button/Button';
import { trackEvent } from 'utils/analytics';

import { up, useBreakpoint } from '../styles/breakpoints';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
  margin-bottom: 137px;

  ${up.mobileLandscape} {
    margin-top: 130px;
    margin-bottom: 134px;
  }

  ${up.tablet} {
    margin-top: 120px;
    margin-bottom: 152px;
  }

  ${up.desktop} {
    margin-top: 223px;
    margin-bottom: 126px;
  }
`;

const Title = styled.div`
  max-width: 295px;

  color: #f9f9f9;
  font-weight: 900;
  font-size: 32px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 44px;
  text-align: center;

  ${up.mobileLandscape} {
    max-width: 488px;

    font-size: 48px;
    line-height: 64px;
  }

  ${up.tablet} {
    max-width: 864px;

    font-size: 48px;
    line-height: 64px;
  }

  ${up.desktop} {
    max-width: 933px;

    font-size: 56px;
    line-height: 64px;
  }
`;

const GradientWrapper = styled.div`
  max-width: 335px;
  margin: 56px 20px 0;
  padding: 2px;

  background: linear-gradient(125deg, #fff738 0%, #36f3ff 50%, #1f50ff 100%);
  border-radius: 16px;

  ${up.mobileLandscape} {
    max-width: 488px;
    margin-top: 44px;
  }

  ${up.tablet} {
    max-width: 864px;
    margin-top: 72px;
  }

  ${up.desktop} {
    max-width: 1068px;
    margin-top: 109px;
  }
`;

const FeaturesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px 20px 48px;

  background: #161616;
  border-radius: 16px;

  ${up.mobileLandscape} {
    padding: 50px;
  }

  ${up.tablet} {
    flex-direction: row;
    padding: 56px 34px 72px 44px;
  }

  ${up.desktop} {
    padding: 64px 98px 64px;
  }
`;

const FeaturesColumn = styled.div`
  flex: 1;
  margin-bottom: 32px;

  ${up.tablet} {
    &:not(:last-child) {
      margin-right: 78px;
    }
    margin-bottom: 0;
  }

  ${up.desktop} {
    &:not(:last-child) {
      margin-right: 164px;
    }
  }
`;

const Feature = styled.div`
  &:not(:last-child) {
    margin-bottom: 32px;
  }
`;

const FeatureTitle = styled.div`
  color: #f9f9f9;
  font-size: 20px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 26px;

  ${up.mobileLandscape} {
    font-size: 28px;
    line-height: 32px;
  }

  ${up.tablet} {
    font-size: 24px;
    line-height: 26px;
  }
`;

const FeatureDescription = styled.div`
  margin-top: 16px;

  color: #f9f9f9;
  font-size: 18px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;

  opacity: 0.5;

  ${up.mobileLandscape} {
    font-size: 16px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 40px;

  ${up.tablet} {
    align-items: flex-start;
    margin-top: 60px;
  }

  & > :not(:last-child) {
    margin-bottom: 20px;
  }
`;

export const Features: FC = () => {
  const isTablet = useBreakpoint(up.tablet);

  return (
    <Wrapper>
      <Title>Store, receive, transfer your money with all those great features</Title>
      <GradientWrapper>
        <FeaturesWrapper>
          <FeaturesColumn>
            <Feature>
              <FeatureTitle>It’s cross-platform</FeatureTitle>
              <FeatureDescription>
                You can use your P2P Wallet everywhere. iOs, Web, Android (soon). Yes, yes, we know,
                it shouldn’t be a feature, but the market shows different...
              </FeatureDescription>
            </Feature>
            <Feature>
              <FeatureTitle>It’s protected</FeatureTitle>
              <FeatureDescription>
                Your device — your keys. We don’t have any access to your private info. Use
                fingerprint or face scanning to access your wallet.
              </FeatureDescription>
            </Feature>
            <Feature>
              <FeatureTitle>It’s fast as a rocket</FeatureTitle>
              <FeatureDescription
                dangerouslySetInnerHTML={{
                  __html: 'Fastest decentralized swap with full transparency in < 1s.',
                }}
              />
            </Feature>
          </FeaturesColumn>
          <FeaturesColumn>
            <Feature>
              <FeatureTitle>It’s designed for people</FeatureTitle>
              <FeatureDescription>
                It’s simple with an intuitive interface inside. Everything under your fingertips.
              </FeatureDescription>
            </Feature>
            <Feature>
              <FeatureTitle>No registration or account setup...</FeatureTitle>
              <FeatureDescription>
                ...actually, it’s up to you. There can be some cool experiences with that
                functionality.
              </FeatureDescription>
            </Feature>
            <ButtonWrapper>
              <ButtonWeb glow onClick={() => trackEvent('landing_go_to_web_wallet_2_click')} />
              <ButtonIOS glow onClick={() => trackEvent('landing_download_for_ios_2_click')} />
            </ButtonWrapper>
          </FeaturesColumn>
        </FeaturesWrapper>
      </GradientWrapper>
    </Wrapper>
  );
};
