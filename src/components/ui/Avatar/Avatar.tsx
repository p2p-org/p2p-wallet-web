import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

const Wrapper = styled.img`
  border-radius: 50%;

  /* transparent pixel for not showing border if no src */
  &:not([src]) {
    content: url('data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==');
  }
`;

type Props = {};

export const Avatar: FunctionComponent<Props> = (props) => {
  return <Wrapper {...props} />;
};
