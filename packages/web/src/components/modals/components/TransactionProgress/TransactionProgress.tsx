import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme, zIndexes } from '@p2p-wallet-web/ui/dist/esm';
import classNames from 'classnames';

import { INITIAL_PROGRESS } from 'components/modals/TransactionInfoModals/TransactionStatusModal/TransactionStatusModal';
import { Icon } from 'components/ui';

export const StatusColors = styled.div`
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

export const OtherIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.buttonPrimary};
`;

export const CheckmarkIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.buttonPrimary};
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
  progress: number;
}

export const TransactionProgress: FC<Props> = (props) => {
  return (
    <ProgressWrapper>
      <ProgressLine
        style={{ width: `${props.progress}%` }}
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
          <CheckmarkIcon name="success-send" />
        ) : (
          <OtherIcon name={props.isError ? 'error-send' : 'clock-send'} />
        )}
      </BlockWrapper>
    </ProgressWrapper>
  );
};
