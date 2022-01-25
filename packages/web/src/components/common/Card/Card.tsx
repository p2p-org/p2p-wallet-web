import type { FunctionComponent } from 'react';
import { forwardRef } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { borders, shadows, up } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

const Wrapper = styled.div`
  padding: 20px;

  background: #fff;
  border-radius: 12px;

  ${up.tablet} {
    ${borders.primary}
    ${shadows.light}
  }
`;

type Props = {
  forwardedRef?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
  className?: string;
};

const CardOriginal: FunctionComponent<Props> = ({
  forwardedRef,
  children,
  className,
  ...props
}) => {
  return (
    <Wrapper ref={forwardedRef} {...props} className={classNames(className)}>
      {children}
    </Wrapper>
  );
};

export const Card = forwardRef<HTMLDivElement, Props>((props, ref: React.Ref<HTMLDivElement>) => (
  <CardOriginal {...props} forwardedRef={ref} />
));
