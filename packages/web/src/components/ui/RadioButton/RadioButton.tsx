import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.label``;

const Label = styled.div`
  position: relative;

  padding: 0 0 0 48px;

  font-weight: 600;
  font-size: 16px;

  cursor: pointer;

  &::before {
    position: absolute;

    top: 3px;
    left: 0;

    width: 20px;
    height: 20px;

    background: #fff;

    border: 2px solid #a3a5ba;
    border-radius: 50%;

    content: '';
  }

  &::after {
    position: absolute;

    top: 9px;
    left: 6px;

    width: 8px;
    height: 8px;

    background: #fff;

    border-radius: 50%;

    opacity: 0;

    transition: 0.2s;

    content: '';
  }
`;

const Radio = styled.input`
  position: absolute;
  z-index: -1;

  opacity: 0;

  &:hover + ${Label}::before {
    border-color: #5887ff;
  }

  &:checked + ${Label}::after {
    opacity: 1;
  }

  &:checked + ${Label}::before, &:focus + ${Label}::before {
    background: #5887ff;
    border-color: #5887ff;
  }
`;

type Props = {
  label: string;
  checked: boolean;
  value: any;
  onChange: (value: any) => void;
  className?: string;
};

export const RadioButton: FunctionComponent<Props> = ({
  label,
  checked,
  value,
  onChange,
  className,
}) => {
  const handleChange = () => {
    onChange(value);
  };

  return (
    <Wrapper className={className}>
      <Radio checked={checked} name="radio-button" type="radio" onChange={handleChange} />
      <Label>{label}</Label>
    </Wrapper>
  );
};
