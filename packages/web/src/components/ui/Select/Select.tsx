import type { FunctionComponent } from 'react';
import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  position: relative;
`;

const PlugIcon = styled(Icon)`
  width: 15px;
  height: 15px;

  color: #a3a5ba;
`;

const Value = styled.div`
  display: inline-block;
  flex-grow: 1;
  overflow: hidden;

  color: #202020;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
  white-space: nowrap;

  text-overflow: ellipsis;

  &:first-letter {
    text-transform: capitalize;
  }
`;

const Selector = styled.div`
  display: flex;
  align-items: center;

  cursor: pointer;

  &.isOpen,
  &:hover {
    ${PlugIcon} {
      color: #5887ff;
    }
  }
`;

const ArrowWrapper = styled.div`
  margin-right: 4px;
`;

const ArrowIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: #a3a5ba;
`;

const DropDownList = styled.div`
  position: absolute;
  right: 0;
  z-index: 1;

  min-width: 204px;
  width: 100%;
  margin-top: 8px;
  padding: 8px;

  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

type Props = {
  value: string | React.ReactNode;
};

export const Select: FunctionComponent<Props> = ({ children, value }) => {
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
    setIsOpen(!isOpen);
  };

  const items = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child, { close: handleSelectorClick });
    }
    return child;
  });

  return (
    <Wrapper ref={selectorRef}>
      <Selector onClick={handleSelectorClick} className={classNames({ isOpen })}>
        <Value>{value}</Value>
        <ArrowWrapper>
          <ArrowIcon name="arrow-triangle" />
        </ArrowWrapper>
      </Selector>
      {isOpen ? <DropDownList>{items}</DropDownList> : undefined}
    </Wrapper>
  );
};
