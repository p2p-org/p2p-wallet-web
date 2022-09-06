import type { FC, ReactNode } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { NotifyToast } from 'components/common/NotifyToast';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { NotificationManagerViewModel } from 'new/ui/managers/NotificationManager/NotificationManager.ViewModel';

const IS_RIGHT = false;

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

export type RendererType = (params: RendererParams) => ReactNode;

const DefaultRenderer = (props: RendererParams) => <NotifyToast {...props} />;

export const NotificationManager: FC = observer(() => {
  const viewModel = useViewModel(NotificationManagerViewModel);

  const renderedToasts = expr(() => {
    const { currentToasts } = viewModel;

    return currentToasts.map(
      ({ id, type, header, text, renderer, isHiding, bottomOffset, ref }) => {
        const isOffsetCalculated = bottomOffset !== undefined;

        const render = renderer || DefaultRenderer;
        const onCloseClick = (hideId: number) => viewModel.hideToast(hideId);

        return (
          <ToastContainer
            key={id}
            ref={ref}
            style={{
              transform: `translate(0, -${bottomOffset}px)`,
            }}
            className={classNames({ isInvisible: !isOffsetCalculated, isRight: IS_RIGHT })}
          >
            <ToastWrapper
              className={classNames({
                isRight: IS_RIGHT,
                isAppearing: isOffsetCalculated,
                isHiding,
              })}
            >
              {render({
                type,
                header,
                text,
                onClose: () => {
                  onCloseClick(id);
                },
              })}
            </ToastWrapper>
          </ToastContainer>
        );
      },
    );
  });
  return (
    <Wrapper
      onMouseEnter={() => {
        viewModel.disableDeferredHiding();
      }}
      onMouseLeave={() => {
        viewModel.enableDeferredHiding();
      }}
    >
      {renderedToasts}
    </Wrapper>
  );
});
