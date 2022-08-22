import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useIntercom } from 'react-use-intercom';

import { styled } from '@linaria/react';
import { theme, zIndexes } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';
import type { LayoutViewModel } from 'new/ui/components/common/Layout/Layout.ViewModel';

import { MOBILE_FOOTER_TABS_HEIGHT } from './constants';

const Wrapper = styled.div`
  position: sticky;
  bottom: 0;
  z-index: ${zIndexes.nav};

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
`;

const Name = styled.span``;

const NavLinkMenu = styled.div`
  display: flex;
  flex: 1;

  color: ${theme.colors.textIcon.secondary};

  /* TODO: temp, delete after release recieve and settings */

  &.disabled {
    pointer-events: none;
  }

  &.active,
  &:hover {
    color: ${theme.colors.textIcon.active};
  }
`;

interface Props {
  viewModel: LayoutViewModel;
}

export const MobileFooterTabs: FC<Props> = ({ viewModel }) => {
  const { showMessages } = useIntercom();

  const handleActionsClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    viewModel.openActionsMobileModal();
  };

  const handleFeedbackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    showMessages();
  };

  return (
    <Wrapper>
      <NavLinkMenu
        as={NavLink}
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
      <NavLinkMenu as={NavLink} to="/actions" onClick={handleActionsClick} className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="info" />
          </IconBlock>
          <Name>Actions</Name>
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu as={NavLink} to="/feedback" onClick={handleFeedbackClick} className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="send-message" />
          </IconBlock>
          <Name>Feedback</Name>
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu
        as={NavLink}
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
