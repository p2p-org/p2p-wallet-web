import type { FC } from 'react';
import { useState } from 'react';
import type { SwipeEventData } from 'react-swipeable';
import { useSwipeable } from 'react-swipeable';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { SWIPE_ACTION_BUTTON_SIZE, SwipeActionButton } from './SwipeActionButton';

const Wrapper = styled.div`
  position: relative;

  overflow: hidden;
`;

const ActionsBehind = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;

  background: ${theme.colors.bg.secondary};
`;

const Content = styled.div`
  transition: all 0.25s ease;

  &.isExpanded {
    overflow: hidden;

    border-radius: 0 4px 4px 0;
    box-shadow: 4px 0 8px #eeeded;
  }
`;

type Action = {
  icon: React.ReactNode;
  onClick: () => void;
};

interface Props {
  actions?: Action[];
}

export const SwipeToRevealActions: FC<Props> = ({ actions, children }) => {
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  function handlePanStart(e: SwipeEventData) {
    if (e.dir === 'Down' || e.dir === 'Up') {
      setIsScrolling(true);
    }
  }

  function handlePanEnd() {
    setIsScrolling(false);
  }

  function handleSwipe(e: SwipeEventData) {
    if (!isScrolling) {
      if (e.dir === 'Left' && !isExpanded) {
        // LEFT SWIPE...
        setIsExpanded(true);
      } else if (e.dir === 'Right' && isExpanded) {
        // RIGHT SWIPE...
        setIsExpanded(false);
      }
    }
  }

  const handlers = useSwipeable({
    onSwipeStart: (eventData) => handlePanStart(eventData),
    onSwiped: () => handlePanEnd(),
    onSwiping: (eventData) => handleSwipe(eventData),
    trackMouse: true,
  });

  return (
    <Wrapper {...handlers}>
      <ActionsBehind>
        {actions?.map((action, index) => (
          <SwipeActionButton key={index} onClick={action.onClick}>
            {action.icon}
          </SwipeActionButton>
        ))}
      </ActionsBehind>
      <Content
        style={{
          transform: `translateX(${
            isExpanded ? `-${(actions?.length || 0) * SWIPE_ACTION_BUTTON_SIZE}px` : '0px'
          })`,
        }}
        className={classNames({ isExpanded })}
      >
        {children}
      </Content>
    </Wrapper>
  );
};
