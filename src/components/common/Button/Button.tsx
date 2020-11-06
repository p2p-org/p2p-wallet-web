import React, { FunctionComponent } from 'react';

import classNames from 'classnames';
import { styled } from 'linaria/react';

const Wrapper = styled.button`
  height: 48px;
  padding: 14px 20px;

  color: #000;
  font-size: 14px;
  line-height: 140%;
  text-align: center;
  white-space: nowrap;

  background: #fff;
  border: 0;
  border-radius: 10px;

  appearance: none;

  &.primary {
    color: #fff;

    background: #000;
  }
`;

type Props = {
  primary?: boolean;
};

export const Button: FunctionComponent<Props> = ({ primary, children }) => {
  return <Wrapper className={classNames({ primary })}>{children}</Wrapper>;
};
