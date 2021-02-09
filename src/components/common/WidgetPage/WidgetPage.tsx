import React, { forwardRef, FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import { Widget } from 'components/common/Widget';
import { Icon } from 'components/ui';

const WrapperWidget = styled(Widget)``;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  background: #5887ff;
  border-radius: 12px;
`;

export const IconStyled = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #fff;
`;

export const Title = styled.div`
  margin-left: 16px;

  color: #000;
  font-weight: 600;
  font-size: 20px;
  line-height: 120%;
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
  return (
    <WrapperWidget
      ref={forwardedRef}
      title={
        <TitleWrapper>
          <IconWrapper>
            <IconStyled name={icon} />
          </IconWrapper>
          <Title>{title}</Title>
        </TitleWrapper>
      }
      action={action}
      className={className}
      {...props}>
      {children}
    </WrapperWidget>
  );
};

export const WidgetPage = forwardRef<HTMLDivElement, Props>(
  (props, ref: React.Ref<HTMLDivElement>) => <WidgetPageOriginal {...props} forwardedRef={ref} />,
);
