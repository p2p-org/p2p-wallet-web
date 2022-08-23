import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Button as UIButton, Icon } from 'components/ui';

const ArrowsIcon = styled(Icon)`
  width: 13px;
  height: 13px;

  color: #5887ff;
`;

const Button = styled(UIButton)`
  padding: 0 10px;

  border: #e5e5e5 solid 1px;
`;

interface Props {
  title: string;
  onClick: () => void;
}

export const AmountTypeButton: FC<Props> = ({ title, onClick }) => (
  <Button onClick={onClick} small>
    {title}&nbsp;
    <ArrowsIcon name="opposite-arrows" />
  </Button>
);
