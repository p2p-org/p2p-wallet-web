import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

const Wrapper = styled.div`
  padding: 24px 48px;

  background-color: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 0 25px rgba(104, 103, 140, 0.15);
`;

type Props = {
  children: React.ReactNode;
};

export const Card: FunctionComponent<Props> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};
