import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Button as UIButton, Icon } from 'components/ui';

const ArrowsIcon = styled(Icon)`
  width: 13px;
  height: 13px;

  color: #5887ff;
`;

const Button = styled(UIButton)`
  border: #E5E5E5 solid 1px;
  padding: 0 10px;
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
