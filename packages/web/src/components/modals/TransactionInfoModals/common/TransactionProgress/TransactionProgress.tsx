import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import { theme, zIndexes } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Icon } from 'components/ui';

import { INITIAL_PROGRESS } from '../../TransactionStatusSendModal';
import { StatusColors, TransactionLabel } from '../styled';

export const ProgressIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.buttonPrimary};
`;

export const TransactionStatus = styled.div`
  display: flex;
  align-items: center;

  margin-top: 13px;
  margin-left: 38px;

  color: ${theme.colors.textIcon.primary};

  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
`;

export const TransactionBadge = styled.div`
  display: flex;
  align-items: center;

  margin-left: 4px;
  padding: 5px 12px;

  color: ${theme.colors.textIcon.secondary};

  font-weight: 500;
  font-size: 12px;

  background: ${theme.colors.bg.secondary};
  border-radius: 4px;
`;

export const ProgressWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  height: 55px;
`;

export const ProgressLine = styled.div`
  position: absolute;

  left: 0;

  z-index: ${zIndexes.middle};

  width: ${INITIAL_PROGRESS}%;
  height: 2px;

  background: ${theme.colors.bg.buttonPrimary};

  transition: width 0.15s;

  &.isSuccess {
    background: ${theme.colors.system.successMain};
  }

  &.isError {
    background: ${theme.colors.system.errorMain};
  }
`;

export const ProgressStub = styled.div`
  position: absolute;

  left: 0;

  z-index: ${zIndexes.bottom};

  width: 100%;
  height: 1px;

  background: ${theme.colors.stroke.secondary};
`;

export const BlockWrapper = styled(StatusColors)`
  z-index: ${zIndexes.top};

  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;

  border-radius: 40%;
`;

export interface Props {
  isError: boolean;
  isProcessing: boolean;
  isSuccess: boolean;
  isExecuting: boolean;
  label: string;
}

const UPPER_PROGRESS_BOUND = 95;
const LOWER_PROGRESS_BOUND = 7;
const FULL_PROGRESS = 100;
const CHECK_PROGRESS_INTERVAL = 2500;

export const TransactionProgress: FC<Props> = (props) => {
  const [progress, setProgress] = useState(INITIAL_PROGRESS);

  useEffect(() => {
    let newProgress = INITIAL_PROGRESS;

    if (!props.isExecuting) {
      return;
    }

    const timerId = setInterval(() => {
      if (progress <= UPPER_PROGRESS_BOUND) {
        newProgress += LOWER_PROGRESS_BOUND;
        setProgress(newProgress);
      } else {
        newProgress = UPPER_PROGRESS_BOUND;
        setProgress(newProgress);
      }
    }, CHECK_PROGRESS_INTERVAL);

    return () => {
      clearTimeout(timerId);
      setProgress(FULL_PROGRESS);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isExecuting]);

  const renderStatus = (executing: boolean, success: boolean, error: boolean) => {
    switch (true) {
      case executing:
        return 'Pending';
      case error:
        return 'Error';
      case success:
        return 'Completed';
      default:
        return 'Pending';
    }
  };

  return (
    <>
      <ProgressWrapper>
        <ProgressLine
          style={{ width: `${progress}%` }}
          className={classNames({
            isSuccess: props.isSuccess,
            isError: props.isError,
          })}
        />
        <ProgressStub />

        <BlockWrapper
          className={classNames({
            isProcessing: props.isProcessing,
            isSuccess: props.isSuccess,
            isError: props.isError,
          })}
        >
          {props.isSuccess ? (
            <ProgressIcon name="success-send" />
          ) : (
            <ProgressIcon name={props.isError ? 'error-send' : 'clock-send'} />
          )}
        </BlockWrapper>
      </ProgressWrapper>
      <TransactionStatus>
        {props.label}
        <TransactionBadge>
          <TransactionLabel
            className={classNames({
              isProcessing: props.isProcessing,
              isSuccess: props.isSuccess,
              isError: props.isError,
            })}
          />
          {renderStatus(props.isExecuting, props.isSuccess, props.isError)}
        </TransactionBadge>
      </TransactionStatus>
    </>
  );
};
