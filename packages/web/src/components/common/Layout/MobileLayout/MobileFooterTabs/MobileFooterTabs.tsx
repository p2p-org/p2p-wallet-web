import type { FC } from 'react';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { MOBILE_FOOTER_TABS_HEIGHT } from 'components/common/Layout/MobileLayout/MobileFooterTabs/constants';
import { Icon } from 'components/ui';

const Wrapper = styled.div`
  z-index: 1;

  display: flex;
  align-content: center;
  width: 100%;
  height: ${MOBILE_FOOTER_TABS_HEIGHT}px;

  background: ${theme.colors.bg.activeSecondary};
  box-shadow: 0 -2px 8px rgba(56, 60, 71, 0.05);
`;

const NavButton = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 600;
  font-size: 12px;
  line-height: 120%;

  border-radius: 12px;
`;

const IconBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const NavIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const Name = styled.span``;

const NavLinkMenu = styled(NavLink)`
  display: flex;
  flex: 1;

  &.active {
    ${NavButton} {
      color: ${theme.colors.textIcon.active};

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

export const MobileFooterTabs: FC = () => {
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
      <NavLinkMenu
        to={{ pathname: '/#', state: { fromPage: location.pathname } }}
        className="button"
      >
        <NavButton>
          <IconBlock>
            <NavIcon name="home" />
          </IconBlock>
          <Name>Actions</Name>
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu
        to={{ pathname: '/#', state: { fromPage: location.pathname } }}
        className="button"
      >
        <NavButton>
          <IconBlock>
            <NavIcon name="home" />
          </IconBlock>
          <Name>Feedback</Name>
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
    </Wrapper>
  );
};
