import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useIntercom } from 'react-use-intercom';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { ModalType, useModals } from 'app/contexts';
import { Icon } from 'components/ui';

import { MOBILE_FOOTER_TABS_HEIGHT } from './constants';

const Wrapper = styled.div`
  z-index: 31;

  display: flex;
  align-content: center;
  width: 100%;
  height: ${MOBILE_FOOTER_TABS_HEIGHT}px;

  background: ${theme.colors.bg.activeSecondary};
  box-shadow: 0 -2px 8px rgba(56, 60, 71, 0.05);

  position: sticky;
  bottom: 0;
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

export const MobileFooterTabs: FC = () => {
  const { openModal } = useModals();
  const { showMessages } = useIntercom();

  const handleActionsClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    openModal(ModalType.SHOW_MODAL_ACTIONS_MOBILE);
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
