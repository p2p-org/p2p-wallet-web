import type { FunctionComponent, ReactElement } from 'react';
import type { Placement } from 'react-laag';
import { Arrow, useHover, useLayer } from 'react-laag';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';

interface Props {
  elContent: string | ReactElement;
  elAnchor?: string | ReactElement;
  placement?: Placement;
  possiblePlacements?: Array<Placement>;
  snap?: boolean;
  withClose?: boolean;
  hideOnScroll?: boolean;
  auto?: boolean;
}

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

const QuestionIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.secondary};
`;

const Anchor = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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
const TOOLTIP_TRIGGER_OFFSET = 5;

export const LaagTooltip: FunctionComponent<Props> = (props) => {
  const [isOver, hoverProps, close] = useHover({ hideOnScroll: props.hideOnScroll });
  const { onMouseEnter, onTouchEnd, onTouchStart } = hoverProps;
  const anchorProps = props.withClose ? { onMouseEnter, onTouchEnd, onTouchStart } : hoverProps;

  const { triggerProps, layerProps, arrowProps, renderLayer } = useLayer({
    isOpen: isOver,
    placement: props.placement,
    possiblePlacements: props.possiblePlacements,
    snap: props.snap,
    auto: props.auto,
    arrowOffset: TOOLTIP_ARROW_OFFSET,
    triggerOffset: TOOLTIP_TRIGGER_OFFSET,
    onOutsideClick: close,
  });

  const elAnchor = props.elAnchor ?? <QuestionIcon name={'question'} />;

  const elClose = (
    <CloseButton onClick={close}>
      <Icon width={12} height={12} name={'close'} />
    </CloseButton>
  );

  return (
    <>
      <Anchor {...triggerProps} {...anchorProps}>
        {elAnchor}
      </Anchor>
      {isOver &&
        renderLayer(
          <TooltipContent className="tooltip" {...layerProps}>
            {props.elContent}
            {props.withClose && elClose}
            <Arrow {...arrowProps} backgroundColor={'rgba(44, 44, 46, 0.9'} angle={35} size={10} />
          </TooltipContent>,
        )}
    </>
  );
};

LaagTooltip.defaultProps = defaultProps;
