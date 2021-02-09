import React, { forwardRef, FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { Card } from '../Card';

const Wrapper = styled(Card)`
  padding: 0;

  box-shadow: 0 4px 4px #f6f6f9;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  padding: 0 20px;

  &:not(:last-child) {
    border-bottom: 1px solid ${rgba(0, 0, 0, 0.05)};
  }
`;

const Title = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 24px;
  line-height: 140%;
`;

const Action = styled.div``;

const Content = styled.div``;

type Props = {
  forwardedRef?: React.Ref<HTMLDivElement>;
  title?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

const WidgetOriginal: FunctionComponent<Props> = ({
  forwardedRef,
  title,
  action,
  children,
  className,
}) => {
  return (
    <Wrapper ref={forwardedRef} className={className}>
      {title || action ? (
        <Header>
          {title ? <Title>{title}</Title> : undefined}
          {action ? <Action>{action}</Action> : undefined}
        </Header>
      ) : undefined}
      {children ? <Content>{children}</Content> : undefined}
    </Wrapper>
  );
};

export const Widget = forwardRef<HTMLDivElement, Props>((props, ref: React.Ref<HTMLDivElement>) => (
  <WidgetOriginal {...props} forwardedRef={ref} />
));
