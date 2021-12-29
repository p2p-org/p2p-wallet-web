import type { FC } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

const WrapperLabel = styled.label`
  position: relative;

  display: flex;
  align-items: center;

  color: #161616;
  font-weight: 500;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;

  cursor: pointer;
`;

const Input = styled.input`
  position: absolute;
  top: 0;
  left: 0;

  width: 20px;
  height: 20px;

  opacity: 0;

  appearance: none;

  &:disabled {
    cursor: not-allowed;
  }
`;

const CheckboxIcon = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 20px;
  margin-right: 10px;

  background: url('./checkbox.svg') no-repeat 50%;

  &.checked {
    &::before {
      position: absolute;

      width: 16px;
      height: 16px;

      background: url('./checkmark.svg') no-repeat 50%;

      content: '';
    }
  }
`;

type Props = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export const Checkbox: FC<Props> = ({ checked, label, onChange }) => {
  return (
    <WrapperLabel>
      <Input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <CheckboxIcon className={classNames({ checked })} />
      {label}
    </WrapperLabel>
  );
};
