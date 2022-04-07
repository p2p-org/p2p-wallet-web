import type { FunctionComponent, ReactElement } from 'react';
import type { Placement, UseHoverOptions, UseLayerOptions } from 'react-laag';
import { Arrow, useHover, useLayer } from 'react-laag';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';

interface TooltipProps {
  elContent: string | ReactElement;
  elAnchor?: string | ReactElement;
  withClose?: boolean;
}

type LaagProps = Pick<UseLayerOptions, 'auto' | 'snap' | 'possiblePlacements' | 'placement'> &
  Pick<UseHoverOptions, 'hideOnScroll'>;

type AnchorProps = {
  iconColor?: string;
};

type OuterProps = LaagProps & AnchorProps & TooltipProps;

const TooltipContent = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: 1fr minmax(0, max-content);
  padding: 12px;

  color: ${theme.colors.textIcon.buttonPrimary};
  font-weight: 400;
  font-size: 15px;
  line-height: 22px;

  background: rgba(44, 44, 46, 0.9);
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
`;

const QuestionIcon = styled(Icon)<AnchorProps>`
  width: 16px;
  height: 16px;

  color: ${(props) => props.iconColor || theme.colors.textIcon.secondary};
`;

const Anchor = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    cursor: pointer;
  }
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;

  color: ${theme.colors.textIcon.buttonPrimary};

  background: #686868;
  border-radius: 8px;
`;

export const globals = css`
  :global() {
    #layers {
      z-index: 1;
    }
  }
`;

const defaultProps = {
  placement: 'top-end' as Placement,
  withClose: false,
  hideOnScroll: false,
  auto: true,
};

const TOOLTIP_ARROW_OFFSET = 15;
const TOOLTIP_TRIGGER_OFFSET = 10;
const CLOSE_BUTTON_SIZE = 12;
const TOOLTIP_ARROW_SIZE = 10;
const TOOLTIP_ARROW_ANGLE = 35;

export const LaagTooltip: FunctionComponent<OuterProps> = ({
  placement,
  withClose,
  possiblePlacements,
  snap,
  auto,
  hideOnScroll,
  iconColor,
  elContent,
  elAnchor,
}) => {
  const [isOver, hoverProps, close] = useHover({ hideOnScroll: hideOnScroll });
  const { onMouseEnter, onTouchEnd, onTouchStart } = hoverProps;
  const anchorProps = withClose ? { onMouseEnter, onTouchEnd, onTouchStart } : hoverProps;

  const { triggerProps, layerProps, arrowProps, renderLayer } = useLayer({
    isOpen: isOver,
    placement: placement,
    overflowContainer: false,
    possiblePlacements: possiblePlacements,
    snap: snap,
    auto: auto,
    arrowOffset: TOOLTIP_ARROW_OFFSET,
    triggerOffset: TOOLTIP_TRIGGER_OFFSET,
    onOutsideClick: close,
  });

  const elTooltipAnchor = elAnchor ?? <QuestionIcon name={'question'} iconColor={iconColor} />;

  const elClose = (
    <CloseButton onClick={close}>
      <Icon width={CLOSE_BUTTON_SIZE} height={CLOSE_BUTTON_SIZE} name={'close'} />
    </CloseButton>
  );

  return (
    <>
      <Anchor {...triggerProps} {...anchorProps}>
        {elTooltipAnchor}
      </Anchor>
      {isOver &&
        renderLayer(
          <TooltipContent className="tooltip" {...layerProps}>
            {elContent}
            {withClose && elClose}
            <Arrow
              {...arrowProps}
              backgroundColor={'rgba(44, 44, 46, 0.9'}
              angle={TOOLTIP_ARROW_ANGLE}
              size={TOOLTIP_ARROW_SIZE}
            />
          </TooltipContent>,
        )}
    </>
  );
};

LaagTooltip.defaultProps = defaultProps;
