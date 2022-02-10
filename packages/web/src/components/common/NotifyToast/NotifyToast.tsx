import type { FunctionComponent } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import type { RendererParams } from 'components/common/ToastManager';
import { Toast } from 'components/common/ToastManager';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Icon } from 'components/ui';

const ToastStyled = styled(Toast)`
  align-items: flex-start;
  position: relative;

  color: #000;

  background-color: #fff;
`;

const ToastIconWrapper = styled.div`
  padding: 10px;
  border-radius: 12px;
`;

const ToastIcon = styled(Icon)`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
`;

const InfoIcon = styled(Icon)`
  flex-shrink: 0;
  width: 24px;
  height: 22px;
`;

const ToastWrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: 0 10px 0 16px;
`;

const ToastHeader = styled.div`
  display: inline-block;

  font-weight: 600;
  font-size: 16px;

  &::first-letter {
    text-transform: uppercase;
  }
`;

const ToastText = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  padding-top: 5px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;

  &.confirmed {
    color: #4caf50;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;

  flex-shrink: 0;
  height: 14px;
  margin: -10px -12px -10px 0;

  color: #a3a5ba;

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
  width: 14px;
  height: 14px;
`;

const StatusIcon = styled(Icon)`
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  margin-right: 8px;
`;

const SwapAvatarsWrapper = styled.div`
  position: relative;

  width: 48px;
  height: 48px;

  & > :nth-child(1) {
    position: absolute;
    top: 0;
    left: 0;
  }

  & > :nth-child(2) {
    position: absolute;
    right: 0;
    bottom: 0;
  }
`;

const ButtonWrapper = styled.div`
  align-items: center;
  margin-top: 8px;
  padding-top: 12px;
`;

type TransferParams = {
  status?:
    | 'processing'
    | 'success'
    | 'error'
    | 'warning'
    | 'confirmingDeposit'
    | 'confirmedDeposit';
  symbol?: string;
  symbolB?: string;
  button?: React.ReactNode;
};

type Props = RendererParams & TransferParams;

export const NotifyToast: FunctionComponent<Props> = ({
  type,
  header,
  text,
  status,
  symbol,
  symbolB,
  onClose,
  button,
}) => {
  let icon;
  let statusIcon;

  switch (type) {
    case 'info':
      icon = <ToastIcon name="success" style={{ color: '#4caf50' }} />;
      break;
    case 'warn':
      icon = <InfoIcon name="attention" />;
      break;
    case 'error':
      icon = <ToastIcon name="error" style={{ color: '#ff5959' }} />;
      break;
    case 'transfer':
    case 'transferChecked':
      icon = <TokenAvatar symbol={symbol} size={44} />;
      break;
    case 'swap':
      icon = (
        <SwapAvatarsWrapper>
          <TokenAvatar symbol={symbol} size={32} />
          <TokenAvatar symbol={symbolB} size={32} />
        </SwapAvatarsWrapper>
      );
      break;
    case 'mint':
      icon = (
        <ToastIconWrapper>
          <ToastIcon name="warning-transparent" style={{ color: '#ffa631' }} />
        </ToastIconWrapper>
      );
      break;
    case 'confirmingDeposit':
      icon = <TokenAvatar symbol="BTC" size={44} />;
      break;
    default:
      icon = null;
  }

  switch (status) {
    case 'processing':
      statusIcon = <StatusIcon name="clock" style={{ color: '#ffa631' }} />;
      break;
    case 'success':
      statusIcon = <StatusIcon name="success" style={{ color: '#4caf50' }} />;
      break;
    case 'error':
      statusIcon = <StatusIcon name="warning" style={{ color: '#ff5959' }} />;
      break;
    case 'confirmingDeposit':
      statusIcon = <StatusIcon name="clock" style={{ color: '#a3a5ba' }} />;
      break;
    case 'confirmedDeposit':
      statusIcon = <StatusIcon name="clock" />;
      break;
    default:
      statusIcon = null;
  }

  return (
    <ToastStyled>
      {icon}
      <ToastWrapper>
        <ToastHeader>{header}</ToastHeader>
        <ToastText className={classNames({ confirmed: status === 'confirmedDeposit' })}>
          {status ? statusIcon : undefined}
          {text}
        </ToastText>
        {button ? <ButtonWrapper>{button}</ButtonWrapper> : undefined}
      </ToastWrapper>
      {onClose ? (
        <CloseButton type="button" name="notify-toast__close" onClick={onClose}>
          <CloseIcon name="close" />
        </CloseButton>
      ) : null}
    </ToastStyled>
  );
};
