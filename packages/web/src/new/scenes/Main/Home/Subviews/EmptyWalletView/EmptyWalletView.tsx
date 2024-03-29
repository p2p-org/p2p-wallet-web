import type { FC } from 'react';
import { useHistory, useLocation } from 'react-router';

import { styled } from '@linaria/react';
import { theme, up, useIsMobile } from '@p2p-wallet-web/ui';

import { NavButton, NavButtonIcon, NavButtons } from 'components/common/NavButtons';
import type { HomeViewModel } from 'new/scenes/Main/Home';
import { trackEvent } from 'new/sdk/Analytics';
import { Card } from 'new/ui/components/ui/Card';

import rocketImg from './rocket.png';

const WrapperCard = styled(Card)`
  position: relative;

  display: grid;
  grid-gap: 8px;
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

type Props = {
  viewModel: HomeViewModel;
};

export const EmptyWalletView: FC<Props> = ({ viewModel }) => {
  const history = useHistory();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleBuyButtonClick = () => {
    trackEvent({ name: 'Wallets_Buy_Button' });

    if (isMobile) {
      viewModel.openChooseBuyTokenMobileModal();
    } else {
      goToRoute('/buy')();
    }
  };

  const handleReceiveButtonClick = () => {
    trackEvent({ name: 'Wallets_Receive_Button' });

    goToRoute('/receive')();
  };

  const goToRoute = (route: string) => () => {
    history.push(route, { fromPage: location.pathname });
  };

  return (
    <WrapperCard>
      <Content>
        <RocketImg src={rocketImg} />
        <Title>Top up your account to get started</Title>
        <Description>Make your first deposit or buy with your credit card</Description>
      </Content>
      <ButtonsWrapper>
        <NavButtonsStyled>
          <NavButtonStyled onClick={handleBuyButtonClick}>
            <NavButtonIcon name="plus" /> Buy
          </NavButtonStyled>
          <NavButtonStyled onClick={handleReceiveButtonClick}>
            <NavButtonIcon name="bottom" /> Receive
          </NavButtonStyled>
        </NavButtonsStyled>
      </ButtonsWrapper>
    </WrapperCard>
  );
};
