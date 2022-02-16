import type { FC } from 'react';
import { useHistory, useLocation } from 'react-router';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Card } from 'components/common/Card';
import { LoaderWide } from 'components/common/LoaderWide';
import { NavButton, NavButtonIcon, NavButtons } from 'components/common/NavButtons';

import rocketImg from './rocket.png';

const WrapperCard = styled(Card)`
  position: relative;

  display: grid;
  grid-gap: 8px;
`;

const Main = styled.div`
  &.isLoading {
    visibility: hidden;
  }
`;

const Content = styled.div`
  display: grid;
  grid-gap: 8px;
  justify-items: center;

  text-align: center;
`;

const RocketImg = styled.img`
  width: 263px;
  height: 263px;
`;

const Title = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.01em;
`;

const Description = styled.div`
  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.01em;
`;

const ButtonsWrapper = styled.div`
  padding: 16px;
`;

const NavButtonsStyled = styled(NavButtons)`
  height: 82px;

  ${up.tablet} {
    height: 68px;
  }
`;

const NavButtonStyled = styled(NavButton)`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 8px;

  font-size: 20px;
`;

interface Props {
  isLoading: boolean;
}

export const EmptyWalletWidget: FC<Props> = ({ isLoading }) => {
  const history = useHistory();
  const location = useLocation();

  const handleButtonClick = (route: string) => () => {
    history.push(route, { fromPage: location.pathname });
  };

  return (
    <WrapperCard>
      {isLoading ? <LoaderWide /> : undefined}
      <Main className={classNames({ isLoading })}>
        <Content>
          <RocketImg src={rocketImg} />
          <Title>Top up your account to get started</Title>
          <Description>Make your first deposit or buy with your credit card</Description>
        </Content>
        <ButtonsWrapper>
          <NavButtonsStyled>
            <NavButtonStyled onClick={handleButtonClick('/buy')}>
              <NavButtonIcon name="plus" /> Buy
            </NavButtonStyled>
            <NavButtonStyled onClick={handleButtonClick('/receive')}>
              <NavButtonIcon name="bottom" /> Receive
            </NavButtonStyled>
          </NavButtonsStyled>
        </ButtonsWrapper>
      </Main>
    </WrapperCard>
  );
};
