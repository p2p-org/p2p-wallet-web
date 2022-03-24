import type { FunctionComponent, ReactElement } from 'react';
import type { Placement } from 'react-laag';
import { Arrow, useHover, useLayer } from 'react-laag';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';

interface Props {
  content: string | ReactElement;
  anchor?: string | ReactElement;
  placement?: Placement;
  snap?: boolean;
}

const TooltipContent = styled.div`
  padding: 12px;

  color: #fff;
  font-weight: 400;
  font-size: 15px;
  line-height: 22px;

  background: rgba(44, 44, 46, 0.9);
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
`;

const QustionIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.secondary};
`;

const Anchor = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const defaultProps = {
  placement: 'top-end' as Placement,
};

export const LaagTooltip: FunctionComponent<Props> = (props) => {
  const [isOver, hoverProps] = useHover();

  const { triggerProps, layerProps, arrowProps, renderLayer } = useLayer({
    isOpen: isOver,
    placement: props.placement,
    snap: props.snap,
    arrowOffset: 15,
    triggerOffset: 5,
  });

  const elAnchor = props.anchor ?? <QustionIcon name={'question'} />;

  return (
    <>
      <Anchor {...triggerProps} {...hoverProps}>
        {elAnchor}
      </Anchor>
      {isOver &&
        renderLayer(
          <TooltipContent className="tooltip" {...layerProps}>
            {props.content}
            <Arrow {...arrowProps} backgroundColor={'rgba(44, 44, 46, 0.9'} angle={35} size={10} />
          </TooltipContent>,
        )}
    </>
  );
};

LaagTooltip.defaultProps = defaultProps;
