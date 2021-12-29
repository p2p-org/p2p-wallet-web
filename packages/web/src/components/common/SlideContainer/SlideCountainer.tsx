import { createRef, PureComponent } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import throttle from 'lodash.throttle';

const SHIFT_SPEED = 0.7;
const SHIFT_AMOUNT = 150;

const Root = styled.div`
  position: relative;

  &.leftshade::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1;

    width: 80px;

    background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));

    content: '';
  }

  &.rightshade::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1;

    width: 80px;

    background: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));

    content: '';
  }
`;

const Wrapper = styled.div`
  position: relative;

  display: block;
  overflow-x: auto;
  overflow-y: hidden;

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

const Content = styled.div`
  display: flex;
  align-items: center;
`;

const ArrowContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 50px;

  cursor: pointer;
`;

const LeftArrowContainer = styled(ArrowContainer)`
  left: 0;
`;

const RightArrowContainer = styled(ArrowContainer)`
  right: 0;
`;

function nextAnimationFrame(callback: () => void) {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(callback);
  } else {
    setTimeout(() => callback(), 16);
  }
}

export class SlideContainer extends PureComponent<React.HTMLAttributes<HTMLDivElement>> {
  state: {
    width: number;
    scrollLeft: number;
    contentWidth: number;
  } = {
    width: 0,
    scrollLeft: 0,
    contentWidth: 0,
  };

  contentRef = createRef<HTMLDivElement>();

  wrapperRef = createRef<HTMLDivElement>();

  stepTs = 0;

  renderLazy = throttle(
    () => {
      this.setState({
        contentWidth: this.contentRef.current?.offsetWidth || 0,
        scrollLeft: this.wrapperRef.current?.scrollLeft || 0,
        width: this.wrapperRef.current?.scrollWidth || 0,
      });
    },
    50,
    { leading: false },
  );

  componentDidMount() {
    window.addEventListener('resize', this.renderLazy);
    this.renderLazy();
  }

  componentDidUpdate() {
    this.renderLazy();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.renderLazy);
    this.renderLazy.cancel();
  }

  onLeftClick = () => {
    this.scroll(SHIFT_AMOUNT, true);
  };

  onRightClick = () => {
    this.scroll(SHIFT_AMOUNT);
  };

  scroll = (px: number, left?: boolean) => {
    this.stepTs = Date.now() - 16;
    this.step(px, left);
  };

  step = (px: number, left?: boolean) => {
    const now = Date.now();
    const delta = now - this.stepTs;
    this.stepTs = now;

    const shift = Math.round(delta * SHIFT_SPEED);

    if (this.wrapperRef.current) {
      if (left) {
        this.wrapperRef.current.scrollLeft -= Math.min(px, shift);
      } else {
        this.wrapperRef.current.scrollLeft += Math.min(px, shift);
      }
    }

    const remain = px - shift;

    if (remain > 0) {
      nextAnimationFrame(() => {
        this.step(remain, left);
      });
    }
  };

  render() {
    const { children, className } = this.props;
    const { contentWidth, scrollLeft, width } = this.state;

    let left = false;
    let right = false;

    if (this.contentRef.current) {
      left = scrollLeft !== 0;
      right = width > scrollLeft + contentWidth;
    }

    return (
      <Root
        className={classNames(className, { leftshade: Boolean(left), rightshade: Boolean(right) })}
      >
        {left ? <LeftArrowContainer onClick={this.onLeftClick} /> : undefined}
        <Wrapper ref={this.wrapperRef} onScroll={this.renderLazy}>
          <Content ref={this.contentRef}>{children}</Content>
        </Wrapper>
        {right ? <RightArrowContainer onClick={this.onRightClick} /> : undefined}
      </Root>
    );
  }
}
