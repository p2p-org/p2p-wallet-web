import { Component, createRef } from 'react';

import { styled } from '@linaria/react';
import throttle from 'lodash.throttle';
import omit from 'ramda/src/omit';

const Wrapper = styled.div``;

type Props = {
  disabled: boolean;
  onNeedLoadMore: () => Promise<never> | void;
};

export class InfinityScrollHelper extends Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  delayedCheck = 0;

  wrapperRef = createRef<HTMLDivElement>();

  checkLoadMore = throttle(async (): Promise<undefined> => {
    const { disabled, onNeedLoadMore } = this.props;

    if (disabled || !this.wrapperRef.current) {
      return;
    }

    const wrapper = this.wrapperRef.current;
    const { bottom } = wrapper.getBoundingClientRect();

    if (window.innerHeight * 1.5 > bottom) {
      await onNeedLoadMore();
      void this.checkLoadMore();
    }
  }, 500);

  componentDidMount() {
    window.addEventListener('scroll', this.checkLoadMore);
    window.addEventListener('resize', this.checkLoadMore);

    this.delayedCheck = window.setTimeout(() => {
      void this.checkLoadMore();
    }, 0);
  }

  componentDidUpdate() {
    void this.checkLoadMore();
  }

  componentWillUnmount() {
    clearTimeout(this.delayedCheck);
    this.checkLoadMore.cancel();

    window.removeEventListener('scroll', this.checkLoadMore);
    window.removeEventListener('resize', this.checkLoadMore);
  }

  render() {
    return <Wrapper {...omit(['onNeedLoadMore', 'disabled'], this.props)} ref={this.wrapperRef} />;
  }
}
