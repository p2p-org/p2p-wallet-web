import React, { forwardRef, FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

const Wrapper = styled.div`
  padding: 20px;

  background: #fff;
  border-radius: 12px;

  &.withShadow {
    box-shadow: 0 4px 4px #f6f6f9;
  }
`;

type Props = {
  forwardedRef?: React.Ref<HTMLDivElement>;
  withShadow?: boolean;
  children?: React.ReactNode;
  className?: string;
};

const CardOriginal: FunctionComponent<Props> = ({
  forwardedRef,
  withShadow,
  children,
  className,
  ...props
}) => {
  return (
    <Wrapper ref={forwardedRef} {...props} className={classNames(className, { withShadow })}>
      {children}
    </Wrapper>
  );
};

export const Card = forwardRef<HTMLDivElement, Props>((props, ref: React.Ref<HTMLDivElement>) => (
  <CardOriginal {...props} forwardedRef={ref} />
));
