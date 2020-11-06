import React, { FunctionComponent } from 'react';

import classNames from 'classnames';
import { styled } from 'linaria/react';
import { rgba } from 'polished';

const Wrapper = styled.div``;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 16px;
`;

const Title = styled.div`
  color: #000;
  font-weight: 500;
  font-size: 18px;
  line-height: 120%;

  &.hasBigTitle {
    font-size: 22px;
  }
`;

const Action = styled.div``;

const Content = styled.div``;

type Props = {
  title: string;
  hasBigTitle?: boolean;
  action?: React.ReactNode;
};

export const Widget: FunctionComponent<Props> = ({
  title,
  hasBigTitle = false,
  action,
  children,
}) => {
  return (
    <Wrapper>
      <Header>
        <Title className={classNames({ hasBigTitle })}>{title}</Title>
        {action ? <Action>{action}</Action> : undefined}
      </Header>
      <Content>{children}</Content>
    </Wrapper>
  );
};
