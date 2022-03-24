import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

import { styled } from '@linaria/react';
import classNames from 'classnames';

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

interface Props {}

// FIX: can produce weird "rattling" during scroll
export const NavButtonsMenu: FC<Props> = () => {
  const history = useHistory();
  const location = useLocation();

  const intersectionRef = useRef(null);
  const [stuck, setStuck] = useState(false);

  const { openModal } = useModals();

  const handleBuyButtonClick = () => {
    openModal(ModalType.SHOW_MODAL_CHOOSE_BUY_TOKEN);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => setStuck((e?.intersectionRatio || 0) < 1), {
      rootMargin: '100px',
      threshold: [1],
    });

    const cachedRef = intersectionRef.current;
    if (cachedRef) {
      observer.observe(cachedRef);
    }

    return () => {
      if (cachedRef) {
        observer.unobserve(cachedRef);
      }
    };
  }, [intersectionRef]);

  const handleButtonClick = (route: string) => () => {
    history.push(route, { fromPage: location.pathname });
  };

  return (
    <Wrapper ref={intersectionRef}>
      <NavButtonsMenuStyled className={classNames({ stuck })}>
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
          {!stuck ? <NavButtonIcon name="swap" /> : undefined}
          Swap
        </NavButton>
      </NavButtonsMenuStyled>
    </Wrapper>
  );
};
