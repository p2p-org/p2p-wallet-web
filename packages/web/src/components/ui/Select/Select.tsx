import type { FunctionComponent } from 'react';
import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import { shadows, theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Loader } from 'components/common/Loader';
import { Icon } from 'components/ui';

const Wrapper = styled.div`
  position: relative;

  flex: 1;
`;

const Value = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden;

  color: ${theme.colors.textIcon.primary};
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
  white-space: nowrap;

  text-overflow: ellipsis;

  &::first-letter {
    text-transform: capitalize;
  }
`;

const CaretIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.secondary};
`;

const Selector = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;

  border: 1px solid ${theme.colors.stroke.secondary};
  border-radius: 12px;

  cursor: pointer;

  &.isOpen,
  &:hover {
    ${CaretIcon} {
      color: ${theme.colors.textIcon.active};
    }
  }

  &.isOpen {
    border-color: ${theme.colors.textIcon.active};

    ${CaretIcon} {
      transform: rotate(180deg);
    }
  }

  &.flat {
    padding: 12px 0;
    border: none;
  }
`;

const CaretWrapper = styled.div`
  margin-right: 4px;
`;

const DropDownList = styled.div`
  position: absolute;
  right: 0;
  z-index: 1;

  width: 100%;
  min-width: 204px;
  padding: 8px;

  background: ${theme.colors.bg.primary};
  border-radius: 12px;
  ${shadows.notification};
`;

type Props = {
  value: string | React.ReactNode;
  isLoading?: boolean;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
  flat?: boolean;
};

export const Select: FunctionComponent<Props> = ({
  value,
  isLoading,
  children,
  onToggle,
  className,
  flat,
}) => {
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

  const handleSelectorClick = () => {
    if (isLoading) {
      return;
    }

    setIsOpen(!isOpen);
    if (onToggle) {
      onToggle(!isOpen);
    }
  };

  const items = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child, { close: handleSelectorClick });
    }
    return child;
  });

  return (
    <Wrapper ref={selectorRef} className={className}>
      <Selector onClick={handleSelectorClick} className={classNames({ isOpen, flat })}>
        <Value>{value}</Value>
        <CaretWrapper>{isLoading ? <Loader size="24" /> : <CaretIcon name="caret" />}</CaretWrapper>
      </Selector>
      {isOpen ? <DropDownList>{items}</DropDownList> : undefined}
    </Wrapper>
  );
};
