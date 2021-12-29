import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import emptyActivityImg from './empty_activity.png';
import emptySearchImg from './empty_search.png';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin: 50px 0;
`;

const EmptyImage = styled.div`
  &.search {
    width: 82px;
    height: 78px;

    background: url(${emptySearchImg}) no-repeat 50% 50%;
    background-size: 82px 78px;
  }

  &.activity {
    width: 100px;
    height: 100px;

    background: url(${emptyActivityImg}) no-repeat 50% 50%;
    background-size: 100px 100px;
  }
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

interface Props {
  type: 'search' | 'activity';
  title?: string;
  desc?: string;
}

export const Empty: FunctionComponent<Props> = ({
  type,
  title = 'Nothing found',
  desc = 'Change your search phrase and try again',
}) => {
  return (
    <Wrapper>
      <EmptyImage className={classNames({ [type]: true })} />
      <Title>{title}</Title>
      <Description>{desc}</Description>
    </Wrapper>
  );
};
