import type { ReactNode, RefObject } from 'react';
import { createRef, PureComponent } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Toast } from './Toast';

const LIMIT = 3;
const HIDE_TIMEOUT = 7000;
const HIDE_LEAVE_TIMEOUT = 5000;

const Wrapper = styled.div`
  position: fixed;
  right: 16px;
  bottom: 8px;
  left: 16px;
  z-index: 9999;

  @media (min-width: 500px) {
    right: 30px;
    bottom: 22px;
    left: 30px;
  }
`;

const ToastContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;

  max-width: 100%;
  padding-bottom: 8px;

  transition: transform 0.3s ease-out;

  &.isRight {
    right: 0;
    left: unset;
  }

  &.isInvisible {
    visibility: hidden;
  }
`;

const ToastWrapper = styled.div`
  &.isAppearing {
    animation: fromBottomAnimation 0.4s ease-out;
  }

  &.isHiding {
    animation: toLeftAnimation 0.3s ease-in forwards;

    &.isRight {
      animation: toRightAnimation 0.3s ease-in forwards;
    }
  }

  @keyframes fromBottomAnimation {
    from {
      transform: translate(0, 1000px);
    }
    to {
      transform: translate(0, 0);
    }
  }

  @keyframes toLeftAnimation {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(-500px, 0);
    }
  }

  @keyframes toRightAnimation {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(500px, 0);
    }
  }
`;

export type RendererParams = {
  type: string;
  header?: string;
  text?: string;
  onClose?: () => void;
};
type RendererType = (params: RendererParams) => ReactNode;

type ToastParams = {
  type: string;
  header?: string;
  text?: string;
  renderer?: RendererType;
};

type SizeType = {
  [id: string]: number;
};

interface Props {
  anchor?: 'left' | 'right';
  renderToast?: RendererType;
  className: string;
}

interface State {
  currentToasts: Array<{ id: number; isHiding?: boolean } & ToastParams>;
  delayedQueue: ToastParams[];
  heights: SizeType;
  bottomOffsets: SizeType;
  isHovered: boolean;
}

let instance: ToastManager | null;

function addToast(params: ToastParams) {
  if (!instance) {
    throw new Error('ToastsManager is not mounted');
  }

  setTimeout(() => {
    if (instance) {
      instance.addToast(params);
    }
  }, 0);
}

/**
 * The component is quite complicated to support nice toast animations
 */
export class ToastManager extends PureComponent<Props, State> {
  static defaultProps = {
    className: undefined,
    anchor: 'left',
    renderToast: undefined,
  };

  static info(header: string, text?: string) {
    addToast({
      type: 'info',
      header,
      text,
    });
  }

  static warn(header: string, text?: string) {
    addToast({
      type: 'warn',
      header,
      text,
    });
  }

  static error(header: string, text?: string) {
    addToast({
      type: 'error',
      header,
      text,
    });
  }

  static show(renderer: RendererType) {
    addToast({
      type: 'component',
      renderer,
    });
  }

  lastId = 0;

  toastsRefs: {
    [id: string]: RefObject<HTMLDivElement>;
  } = {};

  hideTimeouts: number[] = [];

  clearingTimeouts: number[] = [];

  state: State = {
    currentToasts: [],
    delayedQueue: [],
    heights: {},
    bottomOffsets: {},
    isHovered: false,
  };

  componentDidMount() {
    instance = this;

    window.addEventListener('blur', this.onLeave);
  }

  componentDidUpdate(_: Props, prevState: State) {
    const { currentToasts } = this.state;

    const prevLength = prevState.currentToasts.length;

    if (currentToasts.length > 0 && !prevLength) {
      window.addEventListener('resize', this.onResize);
    } else if (currentToasts.length === 0 && prevLength) {
      window.removeEventListener('resize', this.onResize);
    }

    this.checkHeights();
  }

  componentWillUnmount() {
    if (instance === this) {
      instance = null;
    }

    window.removeEventListener('blur', this.onLeave);

    for (const id of this.hideTimeouts) {
      clearTimeout(id);
    }

    for (const id of this.clearingTimeouts) {
      clearTimeout(id);
    }
  }

  onCloseClick = (id: number) => {
    this.startToastsHiding(id);
  };

  onMouseEnter = () => {
    this.setState({
      isHovered: true,
    });

    for (const id of this.hideTimeouts) {
      clearTimeout(id);
    }
  };

  onLeave = () => {
    const { currentToasts } = this.state;

    this.setState({
      isHovered: false,
    });

    if (currentToasts.length === 0) {
      return;
    }

    const hideIds = new Set(currentToasts.map(({ id }) => id));

    const timeoutId = window.setTimeout(() => {
      this.startToastsHiding(hideIds);
    }, HIDE_LEAVE_TIMEOUT);

    this.hideTimeouts.push(timeoutId);
  };

  onResize = () => {
    this.checkHeights();
  };

  getActiveToastsCount() {
    const { currentToasts } = this.state;

    return currentToasts.filter((toast) => !toast.isHiding).length;
  }

  checkDelayedQueue() {
    const { delayedQueue } = this.state;

    if (delayedQueue.length > 0 && this.getActiveToastsCount() < LIMIT) {
      const [firstToast, ...other] = delayedQueue;

      this.setState(
        {
          delayedQueue: other,
        },
        () => {
          this.checkDelayedQueue();
        },
      );

      this.showToast(firstToast);
    }
  }

  startToastsHiding(ids: number | Set<number>) {
    if (!(ids instanceof Set)) {
      // eslint-disable-next-line no-param-reassign
      ids = new Set<number>([ids]);
    }

    const { currentToasts } = this.state;

    this.setState(
      {
        currentToasts: currentToasts.map((toast) => {
          if ((ids as Set<number>).has(toast.id)) {
            return {
              ...toast,
              isHiding: true,
            };
          }

          return toast;
        }),
      },
      () => {
        this.checkDelayedQueue();
      },
    );

    this.clearingTimeouts.push(
      window.setTimeout(() => {
        this.removeToasts(ids as Set<number>);
      }, 400),
    );
  }

  addToast(toastParams: ToastParams): void {
    const { delayedQueue } = this.state;

    if (this.getActiveToastsCount() >= LIMIT) {
      this.setState({
        delayedQueue: delayedQueue.concat(toastParams),
      });
      return;
    }

    this.showToast(toastParams);
  }

  showToast({ type, header, text, renderer }: ToastParams) {
    const { currentToasts, isHovered } = this.state;

    this.lastId += 1;

    const id = this.lastId;

    this.toastsRefs[id] = createRef();

    if (!isHovered) {
      this.startToastHideTimeout(id);
    }

    this.setState({
      currentToasts: currentToasts.concat({
        id,
        type,
        header,
        text,
        renderer,
      }),
    });
  }

  removeToasts(ids: Set<number>) {
    const { currentToasts } = this.state;

    this.setState({
      currentToasts: currentToasts.filter((toast) => !ids.has(toast.id)),
    });
  }

  calcOffsets(heights: SizeType) {
    const { currentToasts, bottomOffsets } = this.state;

    const newBottomOffsets: SizeType = {};
    let totalOffset = 0;

    for (let i = currentToasts.length - 1; i >= 0; i -= 1) {
      const { id, isHiding } = currentToasts[i];

      if (isHiding) {
        newBottomOffsets[id] = bottomOffsets[id];
      } else {
        const height = heights[id];
        let bottomOffset;

        if (height) {
          bottomOffset = totalOffset;
          totalOffset += height;
        } else {
          // TODO:
          bottomOffset = 0;
        }

        newBottomOffsets[id] = bottomOffset;
      }
    }

    this.setState({
      heights,
      bottomOffsets: newBottomOffsets,
    });
  }

  checkHeights() {
    const { currentToasts, heights } = this.state;

    const newHeights: SizeType = {};
    let heightsUpdated = false;

    for (const id of Object.keys(this.toastsRefs)) {
      const ref = this.toastsRefs[id];

      if (ref.current) {
        const foundToast = currentToasts.find((toast) => toast.id === Number(id));

        if (foundToast) {
          const height = foundToast.isHiding ? 0 : ref.current.clientHeight;

          newHeights[id] = height;

          if (heights[id] === undefined || heights[id] !== height) {
            heightsUpdated = true;
          }
        }
      }
    }

    if (heightsUpdated) {
      this.calcOffsets(newHeights);
    }
  }

  startToastHideTimeout(id: number) {
    const timeoutId = window.setTimeout(() => {
      this.startToastsHiding(id);
    }, HIDE_TIMEOUT);

    this.hideTimeouts.push(timeoutId);
  }

  renderToasts() {
    const { renderToast, anchor } = this.props;
    const { currentToasts, bottomOffsets } = this.state;

    const isRight = anchor === 'right';

    return currentToasts.map(({ id, type, header, text, renderer, isHiding }) => {
      const bottomOffset = bottomOffsets[id];
      const isOffsetCalculated = bottomOffset !== undefined;

      const render = renderer || renderToast;

      return (
        <ToastContainer
          key={id}
          ref={this.toastsRefs[id]}
          style={{
            transform: `translate(0, -${bottomOffset}px)`,
          }}
          className={classNames({ isInvisible: !isOffsetCalculated, isRight })}
        >
          <ToastWrapper
            className={classNames({ isRight, isAppearing: isOffsetCalculated, isHiding })}
          >
            {render ? (
              render({ type, header, text, onClose: () => this.onCloseClick(id) })
            ) : (
              <Toast>{header}</Toast>
            )}
          </ToastWrapper>
        </ToastContainer>
      );
    });
  }

  render() {
    const { className } = this.props;

    return (
      <Wrapper className={className} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onLeave}>
        {this.renderToasts()}
      </Wrapper>
    );
  }
}
