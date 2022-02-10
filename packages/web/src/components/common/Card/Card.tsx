import type { FunctionComponent } from 'react';
import * as React from 'react';
import { forwardRef } from 'react';

import { styled } from '@linaria/react';
import { borders, shadows, up } from '@p2p-wallet-web/ui';

const Wrapper = styled.div`
  padding: 20px;

  background: #fff;
  border-radius: 12px;

  ${up.tablet} {
    ${borders.primaryRGBA}
    ${shadows.card}
  }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  forwardedRef?: React.Ref<HTMLDivElement>;
}

const CardOriginal: FunctionComponent<Props> = ({
  forwardedRef,
  children,
  className,
  ...props
}) => {
  return (
    <Wrapper ref={forwardedRef} {...props} className={className}>
      {children}
    </Wrapper>
  );
};

export const Card = forwardRef<HTMLDivElement, Props>((props, ref: React.Ref<HTMLDivElement>) => (
  <CardOriginal {...props} forwardedRef={ref} />
));
