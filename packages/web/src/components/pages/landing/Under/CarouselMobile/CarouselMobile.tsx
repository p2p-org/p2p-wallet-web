import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { up } from 'components/pages/landing/styles/breakpoints';

const Wrapper = styled.div``;

const Carousel = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  padding: 0 40px;

  overflow-x: auto;

  filter: drop-shadow(0 40px 100px rgba(0, 0, 0, 0.15));

  ${up.tablet} {
    padding: 0 80px;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  &::-webkit-scrollbar-track {
    background: none;
  }

  &::-webkit-scrollbar-thumb {
    background: none;
  }
`;

const Container = styled.div`
  display: flex;
  padding-right: 50px;
`;

const SlideImage = styled.div`
  width: 263px;
  height: 570px;

  background-repeat: no-repeat;
  background-position: center;
  background-size: 263px 570px;

  &:not(:last-child) {
    margin-right: 16px;
  }

  ${up.mobileLandscape} {
    width: 313.75px;
    height: 680px;

    background-size: 313.75px 680px;

    &:not(:last-child) {
      margin-right: 20px;
    }
  }

  ${up.tablet} {
    width: 864px;
    height: 554px;

    background-size: 864px 554px;

    &:not(:last-child) {
      margin-right: 0;
    }
  }

  ${up.desktop} {
    width: 1136px;
    height: 730px;

    background-size: 1136px 730px;
  }

  &.one {
    background-image: url('./screen-1-mobile.png');
  }

  &.two {
    background-image: url('./screen-2-mobile.png');
  }

  &.three {
    background-image: url('./screen-3-mobile.png');
  }
`;

const Navigation = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 32px;

  ${up.mobileLandscape} {
    margin-top: 48px;
  }
`;

const Nav = styled.div`
  width: 14px;
  height: 14px;

  background: #161616;
  border-radius: 50%;
  opacity: 0.2;

  &.active {
    opacity: 0.7;
  }

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

export const CarouselMobile: FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const element = carouselRef.current;

    const scrollListener = () => {
      if (!element) {
        return;
      }

      const windowScroll = element.scrollLeft; // Distance of the scrollbar from the leftmost point
      const totalWidth = element.scrollWidth - element.clientWidth; // Total width the scrollbar can traverse

      if (windowScroll === 0) {
        return setScrollProgress(0);
      }

      if (windowScroll > totalWidth) {
        return setScrollProgress(100);
      }

      setScrollProgress((windowScroll / totalWidth) * 100);
    };

    if (element) {
      element.addEventListener('scroll', scrollListener);
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', scrollListener);
      }
    };
  }, []);

  const renderNavs = (count: number) => {
    const selectedDotValue = (scrollProgress * count) / 100;

    return [...new Array(count).keys()].map((index: number) => (
      <Nav
        key={index}
        onClick={() => {
          if (!carouselRef.current) {
            return;
          }

          const element = carouselRef.current;
          // const windowScroll = element.scrollLeft; // Distance of the scrollbar from the leftmost point
          const totalWidth = element.scrollWidth - element.clientWidth; // Total width the scrollbar can traverse

          carouselRef.current.scrollTo({
            left: (totalWidth / count) * (index ? index + 1 : index),
            behavior: 'smooth',
          });
        }}
        className={classNames({
          active: selectedDotValue >= index && selectedDotValue <= index + 1,
        })}
      />
    ));
  };

  return (
    <Wrapper>
      <Carousel ref={carouselRef}>
        <Container>
          <SlideImage className="one" />
          <SlideImage className="two" />
          <SlideImage className="three" />
        </Container>
      </Carousel>
      <Navigation>{renderNavs(3)}</Navigation>
    </Wrapper>
  );
};
