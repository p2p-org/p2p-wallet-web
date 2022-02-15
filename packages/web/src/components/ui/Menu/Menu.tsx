import type { FunctionComponent, HTMLAttributes } from 'react';
import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import { borders, shadows, theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  position: relative;

  color: ${theme.colors.textIcon.tertiary};
`;

const MoreIcon = styled(Icon)`
  width: 24px;
  height: 24px;
`;

const MoreIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;

  &.isOpen,
  &:hover {
    ${MoreIcon} {
      color: ${theme.colors.textIcon.active};
    }

    ${borders.linksRGBA}
  }

  &.vertical {
    transform: rotate(90deg);
  }
`;

const DropDownList = styled.div`
  position: absolute;
  right: 0;
  z-index: 1;

  min-width: 170px;
  margin-top: 4px;
  padding: 8px;

  background: ${theme.colors.bg.primary};
  border-radius: 8px;
  ${shadows.notification}
`;

interface Props extends HTMLAttributes<HTMLDivElement> {
  vertical?: boolean;
}

export const Menu: FunctionComponent<Props> = ({ children, vertical, className }) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAwayClick = (e: MouseEvent) => {
    if (!selectorRef.current?.contains(e.target as HTMLDivElement)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleAwayClick);

    return () => {
      window.removeEventListener('click', handleAwayClick);
    };
  }, []);

  const handleMenuClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e?.preventDefault();

    setIsOpen(!isOpen);
  };

  const items = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child, { close: handleMenuClick });
    }
    return child;
  });

  return (
    <Wrapper ref={selectorRef} className={className}>
      <MoreIconWrapper onClick={handleMenuClick} className={classNames({ isOpen, vertical })}>
        <MoreIcon name="more" />
      </MoreIconWrapper>
      {isOpen ? <DropDownList>{items}</DropDownList> : undefined}
    </Wrapper>
  );
};
