import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Button, Icon } from 'components/ui';

const ArrowsIcon = styled(Icon)`
  width: 13px;
  height: 13px;

  color: #5887ff;
`;

const ButtonStyled = styled(Button)`
  padding: 0 10px;

  border: #e5e5e5 solid 1px;
`;

interface Props {
  title: string;
  onClick: () => void;
}

export const AmountTypeButton: FC<Props> = ({ title, onClick }) => (
  <ButtonStyled onClick={onClick} small>
    {title}&nbsp;
    <ArrowsIcon name="opposite-arrows" />
  </ButtonStyled>
);
