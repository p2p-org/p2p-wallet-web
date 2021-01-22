import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import { RendererParams, Toast } from 'components/common/ToastManager';
import { Icon } from 'components/ui';

const ToastStyled = styled(Toast)`
  color: #000;

  background-color: #fff;
`;

const ToastIcon = styled(Icon)`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
`;

const ToastText = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  padding: 0 10px 0 16px;

  font-size: 15px;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  margin: -10px -12px -10px 0;

  color: #a5a7bd;

  background-color: transparent;
  border: 0;
  outline: none;
  cursor: pointer;

  transition: color 0.15s;

  appearance: none;

  &:hover {
    color: #000;
  }
`;

const CloseIcon = styled(Icon)`
  width: 20px;
  height: 20px;
`;

export const NotifyToast: FunctionComponent<RendererParams> = ({ type, text, onClose }) => {
  let icon;

  switch (type) {
    case 'info':
      icon = <ToastIcon name="success" style={{ color: '#4caf50' }} />;
      break;
    case 'warn':
      icon = <ToastIcon name="warning" style={{ color: '#ffcb60' }} />;
      break;
    case 'error':
      icon = <ToastIcon name="warning" style={{ color: '#ff5959' }} />;
      break;
    default:
      icon = null;
  }

  return (
    <ToastStyled>
      {icon}
      <ToastText>{text}</ToastText>
      {onClose ? (
        <CloseButton type="button" name="notify-toast__close" onClick={onClose}>
          <CloseIcon name="close" />
        </CloseButton>
      ) : null}
    </ToastStyled>
  );
};
