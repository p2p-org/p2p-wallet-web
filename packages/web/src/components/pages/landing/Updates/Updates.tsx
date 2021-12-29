import type { FC } from 'react';

import { styled } from '@linaria/react';

import { up, useBreakpoint } from '../styles/breakpoints';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  justify-content: center;

  ${up.desktop} {
    &::after {
      position: absolute;

      top: -710px;
      left: 0;

      width: 100%;
      height: 1412px;

      background: url('./curves.svg') no-repeat 50%;
      background-size: 100% 1412px;

      content: '';
    }
  }
`;

const Container = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1335px;
  height: 922px;
  margin-bottom: 153px;

  &::before {
    position: absolute;

    display: flex;
    align-self: center;

    width: 967px;
    height: 856px;

    background-image: url('./ellipse-updates.svg');
    background-repeat: no-repeat;
    background-position: 50% 100%;
    background-size: 967px 856px;

    content: '';
  }

  ${up.mobileLandscape} {
    height: 910px;
    margin-bottom: 153px;
  }

  ${up.tablet} {
    height: 873px;
    margin-bottom: 104px;

    &::before {
      width: 1426px;
      height: 873px;

      background-size: 1426px 873px;
    }
  }

  ${up.desktop} {
    height: 873px;
    margin-bottom: 148px;

    &::before {
      right: 80px;

      width: 1474px;
      height: 873px;

      background-position: 0 100%;
      background-size: 1474px 873px;
    }
  }
`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 40px 60px;

  ${up.mobileLandscape} {
    margin: 0 40px 64px;
  }

  ${up.tablet} {
    margin: 45px 80px 80px;
  }

  ${up.desktop} {
    margin: 45px 0 112px;
  }
`;

const Title = styled.div`
  max-width: 295px;

  color: #161616;
  font-size: 36px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 44px;

  ${up.mobileLandscape} {
    max-width: 488px;

    font-size: 44px;
    line-height: 48px;
  }

  ${up.tablet} {
    max-width: 554px;
  }

  ${up.desktop} {
    font-size: 32px;
    line-height: 48px;
  }
`;

const CardWrapper = styled.div`
  z-index: 1;

  display: flex;
  padding: 0 40px;

  overflow-x: auto;
  overflow-y: hidden;

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
    padding: 0 40px;
  }

  ${up.tablet} {
    padding: 0 80px;
  }

  ${up.desktop} {
    padding: 0;
  }
`;

const CardContainer = styled.div`
  display: flex;
  align-items: center;
  padding-right: 50px;

  ${up.desktop} {
    padding-right: 0;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  width: 295px;
  min-width: 295px;
  height: 490px;

  background-image: url('./card.svg');
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: 295px 490px;

  /* TODO: shadow doesn't work right, but image with shadow has artifacts */

  /* box-shadow: 0 32px 64px rgba(0, 0, 0, 0.05); */

  &:not(:last-child) {
    margin-right: 20px;
  }

  ${up.mobileLandscape} {
    width: 468px;
    min-width: 468px;
    height: 450px;

    background-size: 468px 450px;

    &:not(:last-child) {
      margin-right: 32px;
    }
  }

  ${up.tablet} {
    width: 366px;
    min-width: 366px;
    height: 450px;

    background-size: 366px 450px;
  }

  ${up.desktop} {
    width: 416px;
    min-width: 416px;
    height: 416px;

    background-size: 416px 416px;
  }
`;

const CardContent = styled.div`
  margin: 54px 35px 72px 39px;

  ${up.mobileLandscape} {
    margin: 54px 40px 120px;
  }

  ${up.tablet} {
    margin: 54px 40px 76px;
  }

  ${up.desktop} {
    margin: 54px 40px 58px;
  }
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 72px;

  color: #000;
  font-weight: 900;
  font-size: 24px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 32px;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  margin-right: 13px;

  background: #f0b33d;
  border-radius: 4px;

  &.latest {
    background: #00cf3a;
  }

  &.next {
    background: #00b6cf;
  }
`;

const CardTitle = styled.div`
  color: #161616;
  font-weight: bold;
  font-size: 18px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 26px;

  ${up.mobileLandscape} {
    font-size: 24px;
    line-height: 32px;
  }

  ${up.tablet} {
    font-weight: normal;
    font-size: 20px;
  }
`;

const Line = styled.div`
  width: 100%;
  height: 1px;
  margin: 24px 0 16px;

  background: #000;

  ${up.mobileLandscape} {
    margin: 28px 0 16px;
  }

  ${up.tablet} {
    margin: 16px 0 32px;
  }
`;

const Text = styled.div`
  color: #161616;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const ReleasesLinkWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 60px;

  ${up.mobileLandscape} {
    margin-top: 80px;
  }

  ${up.tablet} {
    margin-top: 83px;
  }
`;

const ReleasesLink = styled.a`
  color: #161616;
  font-weight: 500;
  font-size: 18px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 32px;
  text-decoration-line: underline;

  &.top {
    margin-right: 70px;
  }

  ${up.mobileLandscape} {
    font-size: 24px;
    line-height: 48px;
  }
`;

export const Updates: FC = () => {
  const isDesktop = useBreakpoint(up.desktop);

  return (
    <Wrapper>
      <Container>
        <TopWrapper>
          <Title>We are working now with some cool features, check it!</Title>
          {isDesktop ? (
            <ReleasesLink className="top">Our short timeline and releases</ReleasesLink>
          ) : undefined}
        </TopWrapper>
        <CardWrapper>
          <CardContainer>
            <Card>
              <CardContent>
                <Status>
                  <Dot /> Working now
                </Status>
                <CardTitle>Issue name here may be in 2 lines</CardTitle>
                <Line />
                <Text>
                  Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit
                  officia consequat duis enim velit mollit. Exercitation veniam consequat sunt
                  nostrud amet.
                </Text>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Status>
                  <Dot className="latest" /> Latest release
                </Status>
                <CardTitle>Issue name here may be in 2 lines</CardTitle>
                <Line />
                <Text>
                  Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit
                  officia consequat duis enim velit mollit. Exercitation veniam consequat sunt
                  nostrud amet.
                </Text>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Status>
                  <Dot className="next" /> Next
                </Status>
                <CardTitle>Issue name here may be in 2 lines</CardTitle>
                <Line />
                <Text>
                  Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit
                  officia consequat duis enim velit mollit. Exercitation veniam consequat sunt
                  nostrud amet.
                </Text>
              </CardContent>
            </Card>
          </CardContainer>
        </CardWrapper>
        {!isDesktop ? (
          <ReleasesLinkWrapper>
            <ReleasesLink>Our short timeline and releases</ReleasesLink>
          </ReleasesLinkWrapper>
        ) : undefined}
      </Container>
    </Wrapper>
  );
};
