import type { FC, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import type { DERIVATION_PATH, ValueOf } from '@p2p-wallet-web/core';
import classNames from 'classnames';

import { Icon } from 'components/ui';

const Wrapper = styled.div``;

const MainWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 54px;
  padding-right: 16px;

  background: #fff;
  border: 1px solid rgba(22, 22, 22, 0.15);
  border-radius: 12px;

  cursor: pointer;

  &.isOpen {
    border-color: #161616;
    box-shadow: 0 4px 4px #f6f6f9;
  }
`;

const Value = styled.div`
  flex: 1;
`;

const Text = styled.div`
  padding: 16px;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 22px;
`;

const ChevronIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;

  margin-left: 26px;

  &.isOpen {
    transform: rotate(180deg);

    ${ChevronIcon} {
      color: #000;
    }
  }
`;

const DropDownListContainer = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  z-index: 1;

  margin-top: 8px;
  overflow: hidden;

  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.1);
`;

const DropDownList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const DropDownListItem = styled.div`
  cursor: pointer;
`;

export type SelectorItemType = {
  label: string | ReactNode;
  value: ValueOf<typeof DERIVATION_PATH>;
};

type Props = {
  value: SelectorItemType;
  items: SelectorItemType[];
  onChange: (item: SelectorItemType) => void;
  className?: string;
};

export const Selector: FC<Props> = ({ value, items, onChange, className }) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAwayClick = (e: MouseEvent) => {
    if (
      !selectorRef.current?.contains(e.target as HTMLDivElement) &&
      !dropdownRef.current?.contains(e.target as HTMLDivElement)
    ) {
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

  const handleItemClick = (nextValue: SelectorItemType) => () => {
    setIsOpen(false);
    onChange(nextValue);
  };

  const renderValue = () => {
    if (!value) {
      return null;
    }

    if (typeof value.label === 'string') {
      return <Text>{value.label}</Text>;
    }

    return value.label;
  };

  const renderItem = (item: SelectorItemType) => {
    if (typeof item.label === 'string') {
      return <Text>{item.label}</Text>;
    }

    return item.label;
  };

  return (
    <Wrapper className={className}>
      <MainWrapper
        ref={selectorRef}
        onClick={handleSelectorClick}
        className={classNames({ isOpen })}
      >
        <Value>{renderValue()}</Value>
        <ChevronWrapper className={classNames({ isOpen })}>
          <ChevronIcon name="arrow-triangle" />
        </ChevronWrapper>
      </MainWrapper>
      {isOpen ? (
        <DropDownListContainer ref={dropdownRef}>
          <DropDownList ref={listRef}>
            {items.map((item) => (
              <DropDownListItem key={item.value} onClick={handleItemClick(item)}>
                {renderItem(item)}
              </DropDownListItem>
            ))}
          </DropDownList>
        </DropDownListContainer>
      ) : undefined}
    </Wrapper>
  );
};
