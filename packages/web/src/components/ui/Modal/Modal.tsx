import type { FunctionComponent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import { useLocation } from 'react-router';
import { animated, useSpring, useTransition } from 'react-spring';

import { styled } from '@linaria/react';
import { theme, up, useIsMobile } from '@p2p-wallet-web/ui';
import { DialogContent } from '@reach/dialog';
import { useDrag } from '@use-gesture/react';
import BezierEasing from 'bezier-easing';
import classNames from 'classnames';

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
    width: 100%;
    max-height: 80vh;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;

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

const Handle = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  height: 16px;

  &::before {
    position: absolute;

    width: 31px;
    height: 4px;

    background: ${theme.colors.textIcon.buttonDisabled};

    content: '';
  }
`;

const Header = styled.div`
  position: relative;

  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 74px;
`;

const Delimiter = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  &.hasIcon {
    height: 44px;

    ${up.tablet} {
      height: 56px;
    }
  }

  &::before {
    position: absolute;

    width: 100%;
    height: 1px;

    background: ${theme.colors.stroke.secondary};

    content: '';
  }
`;

const IconWrapper = styled.div`
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 44px;
  height: 44px;

  border-radius: 12px;

  ${up.tablet} {
    width: 56px;
    height: 56px;
  }

  &.warning {
    background: ${theme.colors.system.warningMain};
  }
`;

const IconStyled = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.buttonPrimary};

  ${up.tablet} {
    width: 32px;
    height: 32px;
  }
`;

const Title = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 20px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const Description = styled.div`
  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 14px;
  line-height: 120%;
  letter-spacing: 0.01em;
`;

const CloseIcon = styled(Icon)`
  position: absolute;
  top: 25px;
  right: 20px;

  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.active};

  cursor: pointer;
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
  iconName?: string;
  iconBgClassName?: string;

  noDelimiter: boolean;
  close: () => void;
  doNotCloseOnPathChangeMobile?: boolean;
  className?: string;
};

export const Modal: FunctionComponent<Props> = ({
  title,
  description,
  footer,
  iconName,
  iconBgClassName,

  noDelimiter,
  close,
  doNotCloseOnPathChangeMobile,
  className,

  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const currentPath = useRef(location.pathname);

  useEffect(() => {
    if (isMobile && !doNotCloseOnPathChangeMobile && currentPath.current !== location.pathname) {
      close();
    }
  }, [isMobile, doNotCloseOnPathChangeMobile, location.pathname]);

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
              {isMobile ? <Handle /> : undefined}
              {title || description ? (
                <Header>
                  {title ? <Title>{title}</Title> : undefined}
                  {description ? <Description>{description}</Description> : undefined}
                  {!isMobile ? <CloseIcon name="cross" onClick={close} /> : undefined}
                </Header>
              ) : undefined}
              {!noDelimiter ? (
                <Delimiter className={classNames({ hasIcon: Boolean(iconName) })}>
                  {iconName ? (
                    <IconWrapper className={iconBgClassName}>
                      <IconStyled name={iconName} />
                    </IconWrapper>
                  ) : undefined}
                </Delimiter>
              ) : undefined}
              {children ? <Content>{children}</Content> : undefined}
              {footer ? <Footer>{footer}</Footer> : undefined}
            </StyledDialogContent>
          ),
      )}
    </>
  );
};
