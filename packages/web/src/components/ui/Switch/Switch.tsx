import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

const Wrapper = styled.label`
  display: inline-block;
  flex-shrink: 0;
  width: 36px;
  height: 20px;

  background-color: #a3a5ba;
  border: 1px solid #a3a5ba;
  border-radius: 15px;

  cursor: pointer;

  transition: background-color 0.13s;

  &.checked {
    background-color: #34c759;
    border-color: #34c759;
  }
`;

const Toggler = styled.div`
  position: relative;
  top: 1px;
  left: 1px;

  width: 16px;
  height: 16px;

  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);

  transition: left 0.13s, background-color 0.13s;

  &.checked {
    left: 17px;

    background-color: #fff;
  }
`;

const CheckboxHidden = styled.input`
  position: absolute;

  width: 1px;
  height: 1px;

  margin: -1px;
  padding: 0;

  overflow: hidden;

  white-space: nowrap;

  border: 0;

  clip: rect(0 0 0 0);

  clip-path: inset(100%);
`;

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const Switch: FunctionComponent<Props> = ({ checked, onChange }) => {
  const handleTogglerClick = () => {
    onChange(!checked);
  };

  return (
    <Wrapper className={classNames({ checked })}>
      <Toggler className={classNames({ checked })} />
      <CheckboxHidden type="checkbox" checked={checked} onChange={handleTogglerClick} />
    </Wrapper>
  );
};
