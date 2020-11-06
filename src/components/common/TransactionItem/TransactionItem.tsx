import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 69px;
  padding: 15px;

  background: #fff;

  cursor: pointer;

  &:first-child {
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  margin-right: 15px;

  background: #c4c4c4;
  border-radius: 50%;
`;

const Content = styled.div`
  flex: 1;

  font-size: 14px;
  line-height: 17px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #000;
  font-weight: 500;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;

  color: ${rgba('#000', 0.3)};
`;

type Props = {};

export const TransactionItem: FunctionComponent<Props> = ({ type, date, usd, value }) => {
  return (
    <Wrapper>
      <Avatar />
      <Content>
        <Top>
          <div>{type}</div> <div>{usd}</div>
        </Top>
        <Bottom>
          <div>{date}</div> <div>{value}</div>
        </Bottom>
      </Content>
    </Wrapper>
  );
};
