import type { FunctionComponent } from 'react';
import { useLocation } from 'react-router';
import { Link, NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';
import { borders, shadows, theme, up } from '@p2p-wallet-web/ui';
import { Feature } from 'flagged';

import { Icon } from 'components/ui';
import { appStorePath, playStorePath } from 'config/constants';
import { FEATURE_NAV_MENU_BUY_BUTTON } from 'config/featureFlags';
import { trackEvent } from 'utils/analytics';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 8px;
`;

const NavButton = styled.div`
  display: grid;
  grid-template-rows: 30px;
  grid-template-columns: repeat(2, max-content);
  align-items: center;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;

  background: ${theme.colors.bg.primary};

  border-radius: 12px;

  ${borders.primary};
  ${shadows.card}

  ${up.tablet} {
    padding: 10px 10px;
  }

  ${up.desktop} {
    padding: 10px 16px;
  }
`;

const IconBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
`;

const NavIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: ${theme.colors.textIcon.secondary};
`;

const Name = styled.span`
  ${up.tablet} {
    display: none;
  }

  ${up.desktop} {
    display: block;
    margin-left: 8px;
  }
`;

const NavLinkMenu = styled(NavLink)`
  &.active {
    ${NavButton} {
      color: ${theme.colors.textIcon.active};
      font-weight: 700;
      letter-spacing: 0.03em;

      background: ${theme.colors.bg.activePrimary};

      border-color: ${theme.colors.bg.buttonPrimary};

      ${NavIcon} {
        color: ${theme.colors.textIcon.active};
      }
    }
  }

  &:hover {
    ${NavButton} {
      background-color: ${theme.colors.bg.activePrimary};
    }
  }

  &:active {
    ${NavButton} {
      background-color: ${theme.colors.bg.pressed};
    }
  }

  &:focus-visible {
    border-radius: 12px;
    outline: ${theme.colors.textIcon.active} solid 1px;
    outline-offset: 2px;
  }
`;

const Separator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 3px 0;
  padding: 0;
`;

const Line = styled.hr`
  flex: none;
  flex-grow: 0;
  align-self: stretch;
  order: 0;
  height: 2px;
  margin: 0 0;

  background: #f6f6f8;
  border: none;
`;

export const LeftNavMenu: FunctionComponent = () => {
  const location = useLocation();

  const handleAppLinkClick = (store: 'app_store' | 'google_play') => () => {
    if (store === 'app_store') {
      trackEvent('App_Store_Pressed');
    } else if (store === 'google_play') {
      trackEvent('Google_Play_Pressed');
    }
  };

  return (
    <Wrapper>
      <NavLinkMenu
        to={{ pathname: '/wallets', state: { fromPage: location.pathname } }}
        className="button"
      >
        <NavButton>
          <IconBlock>
            <NavIcon name="wallet" />
          </IconBlock>
          <Name>Wallets</Name>
        </NavButton>
      </NavLinkMenu>

      <Feature name={FEATURE_NAV_MENU_BUY_BUTTON}>
        <NavLinkMenu
          to={{ pathname: '/buy', state: { fromPage: location.pathname } }}
          className="button"
        >
          <NavButton>
            <IconBlock>
              <NavIcon name="plus" />
            </IconBlock>
            <Name>Buy</Name>
          </NavButton>
        </NavLinkMenu>
      </Feature>

      <NavLinkMenu
        to={{ pathname: '/receive', state: { fromPage: location.pathname } }}
        className="button"
      >
        <NavButton>
          <IconBlock>
            <NavIcon name="bottom" />
          </IconBlock>
          <Name>Receive</Name>
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu
        to={{ pathname: '/send', state: { fromPage: location.pathname } }}
        className="button"
      >
        <NavButton>
          <IconBlock>
            <NavIcon name="top" />
          </IconBlock>
          <Name>Send</Name>
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu
        to={{ pathname: '/swap', state: { fromPage: location.pathname } }}
        className="button"
      >
        <NavButton>
          <IconBlock>
            <NavIcon name="swap" />
          </IconBlock>
          <Name>Swap</Name>
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu
        to={{ pathname: '/settings', state: { fromPage: location.pathname } }}
        className="button"
      >
        <NavButton>
          <IconBlock>
            <NavIcon name="gear" />
          </IconBlock>
          <Name>Settings</Name>
        </NavButton>
      </NavLinkMenu>
      <Separator>
        <Line />
      </Separator>
      <NavLinkMenu
        to={{ pathname: appStorePath }}
        as={Link}
        target="_blank"
        className="button"
        onClick={handleAppLinkClick('app_store')}
      >
        <NavButton>
          <IconBlock>
            <NavIcon name="app-store" />
          </IconBlock>
          <Name>App Store</Name>
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu
        to={{ pathname: playStorePath }}
        as={Link}
        target="_blank"
        className="button"
        onClick={handleAppLinkClick('google_play')}
      >
        <NavButton>
          <IconBlock>
            <NavIcon name="google-play" />
          </IconBlock>
          <Name>Google Play</Name>
        </NavButton>
      </NavLinkMenu>
    </Wrapper>
  );
};
