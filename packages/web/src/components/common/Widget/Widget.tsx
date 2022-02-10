import type { FunctionComponent } from 'react';
import { forwardRef } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { shadows, theme, up } from '@p2p-wallet-web/ui';

import { Card } from '../Card';

const Wrapper = styled(Card)`
  display: flex;
  flex: 1;
  flex-direction: column;

  padding: 0;

  ${up.tablet} {
    ${shadows.card}
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  margin-top: 8px;
  padding: 8px 20px;
`;

const Title = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 24px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const Action = styled.div``;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

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
