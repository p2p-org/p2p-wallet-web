import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import emptyImg from 'assets/images/empty.png';

const Wrapper = styled.div`
  margin: 50px 0;

  text-align: center;
`;

const Img = styled.img`
  width: 82px;
  height: 78px;
`;

const Title = styled.div`
  margin-top: 12px;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`;

const Description = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

export const Empty: FunctionComponent = () => {
  return (
    <Wrapper>
      <Img src={emptyImg as string} />
      <Title>Nothing found</Title>
      <Description>Change your search phrase and try again</Description>
    </Wrapper>
  );
};
