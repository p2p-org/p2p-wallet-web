import type { FC } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';

const Main = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Label = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
`;

const IconWrapper = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const Value = styled.div`
  display: flex;
  margin-top: 4px;

  font-weight: 600;
  font-size: 16px;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
  padding: 12px 20px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;

  cursor: pointer;

  &:hover {
    ${Value} {
      color: #458aff;
    }

    ${IconWrapper} {
      color: #458aff;
    }
  }
`;

type Props = {
  label: string;
  value: string | React.ReactNode;
  icon?: string | React.ReactNode;
  onClick?: () => void;
  className?: string;
};

const renderIcon = (icon: string | React.ReactNode) => {
  return typeof icon === 'string' ? <IconWrapper name={icon} /> : icon;
};

export const TextField: FC<Props> = ({ label, value, icon, onClick, className }) => {
  return (
    <Wrapper className={className} onClick={onClick}>
      <Main>
        <Label>{label}</Label>
        <Value>{value}</Value>
      </Main>
      {icon ? renderIcon(icon) : undefined}
    </Wrapper>
  );
};
