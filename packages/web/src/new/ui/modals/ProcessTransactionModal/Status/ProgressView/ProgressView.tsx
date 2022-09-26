import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import { theme, zIndexes } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import { TransactionStatusType } from 'new/app/models/PendingTransaction';

import type { ProcessTransactionModalViewModel } from '../../ProcessTransactionModal.ViewModel';

const INITIAL_PROGRESS = 5;

const ProgressIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.buttonPrimary};
`;

// const TransactionStatus = styled.div`
//   display: flex;
//   align-items: center;
//
//   margin-top: 13px;
//   margin-left: 38px;
//
//   color: ${theme.colors.textIcon.primary};
//
//   font-weight: 500;
//   font-size: 16px;
//   line-height: 140%;
// `;
//
// const TransactionBadge = styled.div`
//   display: flex;
//   align-items: center;
//
//   height: 24px;
//   margin-left: 4px;
//   padding: 0 8px;
//
//   color: ${theme.colors.textIcon.secondary};
//
//   font-weight: 500;
//   font-size: 12px;
//
//   background: ${theme.colors.bg.secondary};
//   border-radius: 4px;
// `;

const ProgressWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  height: 55px;
`;

const ProgressLine = styled.div`
  position: absolute;

  left: 0;

  z-index: ${zIndexes.middle};

  width: ${INITIAL_PROGRESS}%;
  height: 2px;

  background: ${theme.colors.bg.buttonPrimary};

  transition: width 0.15s;

  &.isSuccess {
    background: ${theme.colors.system.successMain};

    transition: none;
  }

  &.isError {
    background: ${theme.colors.system.errorMain};

    transition: none;
  }
`;

const ProgressStub = styled.div`
  position: absolute;

  left: 0;

  z-index: ${zIndexes.bottom};

  width: 100%;
  height: 1px;

  background: ${theme.colors.stroke.secondary};
`;

const StatusColors = styled.div`
  &.isProcessing {
    background: ${theme.colors.system.warningMain};
  }

  &.isSuccess {
    background: ${theme.colors.system.successMain};
  }

  &.isError {
    background: ${theme.colors.system.errorMain};
  }
`;

// const TransactionLabel = styled(StatusColors)`
//   display: block;
//   width: 8px;
//   height: 8px;
//
//   margin-right: 8px;
// `;

const BlockWrapper = styled(StatusColors)`
  z-index: ${zIndexes.top};

  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;

  border-radius: 40%;
`;

const UPPER_PROGRESS_BOUND = 95;
const LOWER_PROGRESS_BOUND = 3;
const FULL_PROGRESS = 100;
const CHECK_PROGRESS_INTERVAL = 1000;

export interface Props {
  viewModel: Readonly<ProcessTransactionModalViewModel>;
  // label: string;
}

export const ProgressView: FC<Props> = observer(({ viewModel /*label*/ }) => {
  const [progress, setProgress] = useState(INITIAL_PROGRESS);

  const status = viewModel.pendingTransaction!.status;
  const isSending = status.type === TransactionStatusType.sending;
  const isProcessing = status.type === TransactionStatusType.confirmed;
  const isSuccess = status.type === TransactionStatusType.finalized;
  const isError = status.type === TransactionStatusType.error;

  useEffect(() => {
    let newProgress = INITIAL_PROGRESS;

    if (!isProcessing) {
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
    };
  }, [status.type]);

  useEffect(() => {
    switch (status.type) {
      case TransactionStatusType.error:
      case TransactionStatusType.finalized:
        setProgress(FULL_PROGRESS);
        setTimeout(() => {
          setProgress(0);
        }, 1000);
        break;
    }
  }, [status.type]);

  // const renderStatus = () => {
  //   switch (status.type) {
  //     case TransactionStatusType.sending:
  //     case TransactionStatusType.confirmed:
  //       return 'Pending';
  //     case TransactionStatusType.error:
  //       return 'Error';
  //     case TransactionStatusType.finalized:
  //       return 'Completed';
  //   }
  // };

  return (
    <>
      <ProgressWrapper>
        <ProgressLine
          style={{ width: `${progress}%` }}
          className={classNames({ isSuccess, isError })}
        />
        <ProgressStub />

        <BlockWrapper
          className={classNames({ isProcessing: isSending || isProcessing, isSuccess, isError })}
        >
          {isSuccess ? (
            <ProgressIcon name="success-send" />
          ) : (
            <ProgressIcon name={isError ? 'error-send' : 'clock-send'} />
          )}
        </BlockWrapper>
      </ProgressWrapper>
      {/*<TransactionStatus>*/}
      {/*  {label}*/}
      {/*  <TransactionBadge>*/}
      {/*    <TransactionLabel*/}
      {/*      className={classNames({ isProcessing: isSending || isProcessing, isSuccess, isError })}*/}
      {/*    />*/}
      {/*    {renderStatus()}*/}
      {/*  </TransactionBadge>*/}
      {/*</TransactionStatus>*/}
    </>
  );
});
