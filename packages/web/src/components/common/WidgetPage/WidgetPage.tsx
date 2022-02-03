import type { FunctionComponent } from 'react';
import { forwardRef } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { theme, useIsTablet } from '@p2p-wallet-web/ui';

import { Widget } from 'components/common/Widget';
import { Icon } from 'components/ui';

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
`;

export const IconStyled = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.secondary};
`;

export const Title = styled.div`
  margin-left: 8px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 24px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

type Props = {
  forwardedRef?: React.Ref<HTMLDivElement>;
  icon: string;
  title: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

const WidgetPageOriginal: FunctionComponent<Props> = ({
  forwardedRef,
  icon,
  title,
  action,
  children,
  className,
  ...props
}) => {
  const isTable = useIsTablet();

  return (
    <Widget
      ref={forwardedRef}
      title={
        isTable ? (
          <TitleWrapper>
            <IconWrapper>
              <IconStyled name={icon} />
            </IconWrapper>
            <Title>{title}</Title>
          </TitleWrapper>
        ) : undefined
      }
      action={action}
      className={className}
      {...props}
    >
      {children}
    </Widget>
  );
};

export const WidgetPage = forwardRef<HTMLDivElement, Props>(
  (props, ref: React.Ref<HTMLDivElement>) => <WidgetPageOriginal {...props} forwardedRef={ref} />,
);
