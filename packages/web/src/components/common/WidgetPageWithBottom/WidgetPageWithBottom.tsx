import type { FunctionComponent } from 'react';
import { forwardRef } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';

import { WidgetPage } from 'components/common/WidgetPage';

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;

  ${up.tablet} {
    flex: initial;
    justify-content: initial;
  }
`;

const Content = styled.div`
  display: grid;
  grid-gap: 16px;
  padding: 16px;

  ${up.tablet} {
    padding: 16px 20px;
  }
`;

const BottomWrapper = styled.div`
  padding: 16px;

  ${up.tablet} {
    border-top: 1px solid ${theme.colors.stroke.tertiary};
  }
`;

type Props = {
  forwardedRef?: React.Ref<HTMLDivElement>;
  icon: string;
  title: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  bottom?: React.ReactNode;
  className?: string;
};

const WidgetPageWithBottomOriginal: FunctionComponent<Props> = ({
  forwardedRef,
  icon,
  title,
  action,
  children,
  bottom,
  className,
  ...props
}) => {
  return (
    <WidgetPage
      ref={forwardedRef}
      title={title}
      icon={icon}
      action={action}
      className={className}
      {...props}
    >
      <Wrapper>
        <Content>{children}</Content>
        {bottom ? <BottomWrapper>{bottom}</BottomWrapper> : undefined}
      </Wrapper>
    </WidgetPage>
  );
};

export const WidgetPageWithBottom = forwardRef<HTMLDivElement, Props>(
  (props, ref: React.Ref<HTMLDivElement>) => (
    <WidgetPageWithBottomOriginal {...props} forwardedRef={ref} />
  ),
);
