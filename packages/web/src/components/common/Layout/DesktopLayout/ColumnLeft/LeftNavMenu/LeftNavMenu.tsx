import type { FunctionComponent } from 'react';
import { useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';
import { borders, shadows, theme, up } from '@p2p-wallet-web/ui';
import { Feature } from 'flagged';

import { Icon } from 'components/ui';
import { appStorePath, playStorePath } from 'config/constants';
import { FEATURE_NAV_MENU_BUY_BUTTON } from 'config/featureFlags';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 8px;
`;

const NavButton = styled.div`
  display: flex;
  align-items: center;
  height: 52px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;

  background: ${theme.colors.bg.primary};

  border-radius: 12px;

  ${up.tablet} {
    padding: 10px 10px;
    ${borders.primary};
    ${shadows.light}
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
    margin-left: 20px;
  }
`;

const NavLinkMenu = styled(NavLink)`
  &.active {
    ${NavButton} {
      color: #5887ff;

      background: ${theme.colors.bg.activePrimary};

      ${IconBlock} {
        color: ${theme.colors.textIcon.secondary};

        ${NavIcon} {
          color: ${theme.colors.textIcon.active};
        }
      }
    }
  }

  /* TODO: temp, delete after release recieve and settings */
  &.disabled {
    pointer-events: none;
  }

  &:hover {
    ${NavButton} {
      color: ${theme.colors.textIcon.active};

      ${IconBlock} {
        color: ${theme.colors.textIcon.active};

        ${NavIcon} {
          color: ${theme.colors.textIcon.active};
        }
      }
    }
  }
`;

const Separator = styled.div`
  display: flex;
  align-items: center;
  padding: 0px;
  margin: 8px 0px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Line = styled.hr`
  flex: none;
  order: 0;
  height: 2px;
  align-self: stretch;
  border: none;
  flex-grow: 0;
  margin: 0px 0px;
  background: #f6f6f8;
`;

export const LeftNavMenu: FunctionComponent = () => {
  const location = useLocation();

  return (
    <Wrapper>
      <NavLinkMenu
        to={{ pathname: '/wallets', state: { fromPage: location.pathname } }}
        className="button"
      >
        <NavButton>
          <IconBlock>
            <NavIcon name="home" />
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
      <NavLinkMenu to={{ pathname: appStorePath }} target="_blank" className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="app-store" />
          </IconBlock>
          <Name>App Store</Name>
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu to={{ pathname: playStorePath }} target="_blank" className="button">
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
