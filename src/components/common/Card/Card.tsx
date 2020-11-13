import React, { FunctionComponent } from 'react';

import classNames from 'classnames';
import { styled } from 'linaria/react';

const Wrapper = styled.div`
  padding: 20px;

  background: #fff;
  border-radius: 10px;

  &.withShadow {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  }
`;

type Props = {
  withShadow?: boolean;
  className?: string;
};

export const Card: FunctionComponent<Props> = ({ withShadow, children, className, ...props }) => {
  return (
    <Wrapper {...props} className={classNames(className, { withShadow })}>
      {children}
    </Wrapper>
  );
};
