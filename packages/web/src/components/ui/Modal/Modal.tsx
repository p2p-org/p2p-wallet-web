import type { FunctionComponent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import { animated, useSpring, useTransition } from 'react-spring';

import { styled } from '@linaria/react';
import { theme, up, useIsMobile } from '@p2p-wallet-web/ui';
import { DialogContent } from '@reach/dialog';
import { useDrag } from '@use-gesture/react';
import BezierEasing from 'bezier-easing';

import { MOBILE_FOOTER_TABS_HEIGHT } from 'components/common/Layout';
import { Icon } from 'components/ui';

const easing = BezierEasing(0.7, -0.4, 0.4, 1.4);

const AnimatedDialogContent = animated(DialogContent);

const StyledDialogContent = styled(({ ...props }) => <AnimatedDialogContent {...props} />)`
  overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};

  &[data-reach-dialog-content] {
    position: fixed;
    right: 0;
    bottom: ${MOBILE_FOOTER_TABS_HEIGHT}px;

    display: flex;
    flex-direction: column;
    align-self: flex-end;
    width: 100vw;
    height: 80vh;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: scroll;

    background: ${theme.colors.bg.primary};
    border-radius: 18px 18px 0 0;

    touch-action: none;

    ${up.tablet} {
      position: relative;
      right: unset;
      bottom: unset;

      align-self: center;
      width: unset;
      height: unset;
      margin: 0;
      overflow-y: hidden;

      border-radius: 12px;
    }
  }
`;

const Header = styled.div`
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 74px;

  border-bottom: 1px solid ${theme.colors.stroke.secondary};
`;

const Title = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 20px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const Description = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
`;

const CloseWrapper = styled.div`
  position: absolute;
  top: 25px;
  right: 20px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  cursor: pointer;
`;

const CloseIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.active};
`;

const Content = styled.div`
  padding: 0 16px;

  ${up.tablet} {
    padding: 0 20px;
  }
`;

const Footer = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-gap: 16px;
  margin-bottom: 16px;
  padding: 0 16px;

  ${up.tablet} {
    grid-auto-flow: column;
    padding: 20px;
  }
`;

type Props = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  close: () => void;
  className?: string;
};

export const Modal: FunctionComponent<Props> = ({
  title,
  description,
  footer,
  close,
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsOpen(true);

    return () => {
      setIsOpen(false);
    };
  }, []);

  const config = useMemo(() => {
    if (isMobile) {
      return {
        config: { duration: 600, easing: (t: number) => easing(t) },
        from: { transform: 'translateY(100px)' },
        enter: { transform: 'translateX(0)' },
        leave: { transform: 'translateY(100px)' },
      };
    }

    return {
      // config: { duration: 600, easing: (t: number) => easing(t) },
      // from: { transform: 'translateX(422px)' },
      // enter: { transform: 'translateX(0)' },
      // leave: { transform: 'translateX(422px)' },
    };
  }, [isMobile]);

  const fadeTransition = useTransition(isOpen, null, config);

  const [{ y }, set] = useSpring(() => ({ y: 0, config: { mass: 1, tension: 210, friction: 20 } }));
  const bind = useDrag((state) => {
    set({
      y: state.down ? state.movement[1] : 0,
    });
    if (state.movement[1] > 300 || (state.velocity[1] > 3 && state.direction[1] > 0)) {
      close();
    }
  });

  return (
    <>
      {fadeTransition.map(
        ({ item, key, props }) =>
          item && (
            <StyledDialogContent
              key={key}
              {...(isMobile
                ? {
                    ...bind(),
                    style: {
                      ...props,
                      transform: y.interpolate((n) => `translateY(${(n as number) > 0 ? n : 0}px)`),
                    },
                  }
                : {
                    style: props,
                  })}
              aria-label="dialog"
              className={className}
            >
              <Header>
                {title ? <Title>{title}</Title> : undefined}
                {description ? <Description>{description}</Description> : undefined}
                {!isMobile ? (
                  <CloseWrapper onClick={close}>
                    <CloseIcon name="cross" />
                  </CloseWrapper>
                ) : undefined}
              </Header>
              {children ? <Content>{children}</Content> : undefined}
              {footer ? <Footer>{footer}</Footer> : undefined}
            </StyledDialogContent>
          ),
      )}
    </>
  );
};
