import React, { FunctionComponent } from 'react';

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
