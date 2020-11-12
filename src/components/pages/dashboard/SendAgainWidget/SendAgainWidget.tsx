import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { Widget } from 'components/common/Widget';
import { Avatar } from 'components/ui';

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 14px;
`;

const UserWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;

  cursor: pointer;
`;

const AvatarStyled = styled(Avatar)`
  width: 56px;
  height: 56px;

  background: ${rgba('#c4c4c4', 0.5)};
`;

const Username = styled.div`
  margin-top: 12px;

  color: #000;
  font-size: 13px;
  line-height: 140%;
`;

type Props = {};

export const SendAgainWidget: FunctionComponent<Props> = (props) => {
  return (
    <Widget title="Send again">
      <Wrapper>
        {['Konstantin', 'Martin', 'John', 'Olouwebeke'].map((name) => (
          <UserWrapper key={name}>
            <AvatarStyled />
            <Username>{name}</Username>
          </UserWrapper>
        ))}
      </Wrapper>
    </Widget>
  );
};
