import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Icon } from 'components/ui';

import { up } from '../../styles/breakpoints';
import { Item } from './Item';
import oneImg from './screen-1-desktop.png';
import twoImg from './screen-2-desktop.png';
import threeImg from './screen-3-desktop.png';
import fourImg from './screen-4-desktop.png';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1136px;

  user-select: none;
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  border-radius: 10px;
  box-shadow: -34px 42px 100px rgba(0, 0, 0, 0.05);

  ${up.tablet} {
    & > img {
      width: 864px;
      height: 554px;
    }
  }

  ${up.desktop} {
    & > img {
      width: 1136px;
      height: 728px;
    }
  }
`;

const ArrowIconWrapper = styled.div`
  position: absolute;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;

  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.03);
  cursor: pointer;

  &:hover,
  &:active {
    background: #fafafa;
  }

  &.top {
    top: 0;
  }

  &.bottom {
    bottom: 0;

    transform: rotate(180deg);
  }
`;

const ChevronIcon = styled(Icon)`
  width: 16px;
  height: 13px;

  color: #000;
`;

const Navigation = styled.div`
  position: relative;
  right: -17px;

  display: flex;
  align-items: center;
  justify-content: center;

  height: 181px;

  ${up.desktop} {
    right: -50px;
  }
`;

const Dots = styled.div``;

const Dot = styled.div`
  width: 15px;
  height: 10px;

  background: #161616;
  border-radius: 18px;
  opacity: 0.05;

  &.active {
    opacity: 0.3;
  }

  &:not(:last-child) {
    margin-bottom: 5px;
  }
`;

const ITEMS = [
  {
    src: oneImg,
  },
  {
    src: twoImg,
  },
  {
    src: threeImg,
  },
  {
    src: fourImg,
  },
];

export const CarouselDesktop: FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelectToken = (index: number) => () => {
    setActiveIndex(index);
  };

  const handleNext = () => {
    setActiveIndex((state) => state + 1);
  };

  const handlePrev = () => {
    setActiveIndex((state) => state - 1);
  };

  const prepareItems = () => {
    return ITEMS.map((item, index) => (
      <ItemWrapper key={item.src} onClick={handleSelectToken(index)}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={item.src} />
      </ItemWrapper>
    ));
  };

  const renderItems = () => {
    const items = prepareItems();

    const newItems = [];

    for (let i = 0; i < items.length; i++) {
      let index = i;

      if (i < 0) {
        index = items.length + i;
      }

      newItems.push(
        <Item key={i} className={`${i}`} level={i - activeIndex}>
          {items[index]}
        </Item>,
      );
    }

    return newItems;
  };

  return (
    <Wrapper>
      {renderItems()}
      <Navigation>
        {activeIndex !== 0 ? (
          <ArrowIconWrapper className="top" onClick={handlePrev}>
            <ChevronIcon name="chevron-rounded" />
          </ArrowIconWrapper>
        ) : null}
        <Dots>
          {ITEMS.map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Dot key={index} className={classNames({ active: index === activeIndex })} />
          ))}
        </Dots>
        {activeIndex !== ITEMS.length - 1 ? (
          <ArrowIconWrapper className="bottom" onClick={handleNext}>
            <ChevronIcon name="chevron-rounded" />
          </ArrowIconWrapper>
        ) : null}
      </Navigation>
    </Wrapper>
  );
};
