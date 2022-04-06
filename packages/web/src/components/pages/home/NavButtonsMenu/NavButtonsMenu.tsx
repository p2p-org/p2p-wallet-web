import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import throttle from 'lodash.throttle';

import { ModalType, useModals } from 'app/contexts/general/modals';
import { NavButton, NavButtonIcon, NavButtons } from 'components/common/NavButtons';

const Wrapper = styled.div`
  position: sticky;
  top: -1px;
  z-index: 1;

  padding-top: 17px;
`;

const NavButtonsMenuStyled = styled(NavButtons)`
  height: 82px;

  &.stuck {
    height: 50px;
  }
`;

const MENU_TRIGGER_OFFSET = 100;

export const NavButtonsMenu: FC = () => {
  const history = useHistory();
  const location = useLocation();

  const menuRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  const { openModal } = useModals();

  const handleBuyButtonClick = () => {
    openModal(ModalType.SHOW_MODAL_CHOOSE_BUY_TOKEN_MOBILE);
  };

  useEffect(() => {
    const onScroll = throttle(() => {
      const menuBottomEdge = menuRef?.current?.getBoundingClientRect()?.bottom;

      if (menuBottomEdge) {
        setStuck(menuBottomEdge < MENU_TRIGGER_OFFSET);
      }
    }, 200);

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleButtonClick = (route: string) => () => {
    history.push(route, { fromPage: location.pathname });
  };

  return (
    <Wrapper>
      <NavButtonsMenuStyled className={classNames({ stuck })} ref={menuRef}>
        <NavButton onClick={handleBuyButtonClick}>
          {!stuck ? <NavButtonIcon name="plus" /> : undefined} Buy
        </NavButton>
        <NavButton onClick={handleButtonClick('/receive')}>
          {!stuck ? <NavButtonIcon name="bottom" /> : undefined}
          Receive
        </NavButton>
        <NavButton onClick={handleButtonClick('/send')}>
          {!stuck ? <NavButtonIcon name="top" /> : undefined}
          Send
        </NavButton>
        <NavButton onClick={handleButtonClick('/swap')}>
          {!stuck ? <NavButtonIcon name="arrow-swap" /> : undefined}
          Swap
        </NavButton>
      </NavButtonsMenuStyled>
    </Wrapper>
  );
};
