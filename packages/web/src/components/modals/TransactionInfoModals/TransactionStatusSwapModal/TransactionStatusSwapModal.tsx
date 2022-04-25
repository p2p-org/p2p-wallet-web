import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { useConnectionContext, useTransaction, useWallet } from '@p2p-wallet-web/core';

import type { ModalPropsType } from 'app/contexts';
import { ToastManager } from 'components/common/ToastManager';
import type { FeesOriginalProps } from 'components/pages/swap/SwapWidget/Fees/FeesOriginal';
import { FeesOriginal } from 'components/pages/swap/SwapWidget/Fees/FeesOriginal';
import { trackEvent } from 'utils/analytics';

import { DateHeader, SolanaExplorerLink, TransactionProgress } from '../common';
import { CloseIcon, CloseWrapper, Header, Section, Wrapper } from '../common/styled';
import type { SwapParams } from '../TransactionStatusModal/Swap';

const DEFAULT_TRANSACTION_ERROR = 'Transaction error';

type SwapActionType = () => Promise<string>;

type ModalProps = {
  action: SwapActionType;
  params: SwapParams;
};

export type TransactionStatusModalProps = FeesOriginalProps & ModalProps;

const CHECK_TRANSACTION_INTERVAL = 3000;

export const TransactionStatusModal: FunctionComponent<
  ModalPropsType<string | null> & TransactionStatusModalProps
> = ({
  action,
  close,
  userTokenAccounts,
  priceInfo,
  solanaProvider,
  swapInfo,
  feeLimitsInfo,
  feeCompensationInfo,
  networkFees,
  // params,
}) => {
  const { provider } = useWallet();

  const [isExecuting, setIsExecuting] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const transaction = useTransaction(signature);
  const [transactionError, setTransactionError] = useState(
    transaction?.raw?.meta?.err ? DEFAULT_TRANSACTION_ERROR : '',
  );
  const { network } = useConnectionContext();

  const executeAction = async () => {
    try {
      setIsExecuting(true);

      const resultSignature = await action();
      setSignature(resultSignature);
    } catch (error) {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    void executeAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mount = async () => {
      if (!signature) {
        return;
      }

      try {
        const trx = await provider.connection.getTransaction(signature, {
          commitment: 'confirmed',
        });
        if (trx) {
          if (trx.meta?.err) {
            setTransactionError(DEFAULT_TRANSACTION_ERROR);
          } else if (transactionError) {
            setTransactionError('');
          }
        } else {
          setTimeout(mount, CHECK_TRANSACTION_INTERVAL);
        }
      } catch (error) {
        // setTransactionError((error as Error).message);
        ToastManager.error((error as Error).message);
      } finally {
        setIsExecuting(false);
      }
    };

    void mount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const handleCloseClick = () => {
    // @ts-ignore
    trackEvent('swap_close_click', { transactionConfirmed: !isExecuting });

    close(signature);
  };
  const isProcessing = (!signature || !transaction?.key) && !transactionError;
  const isSuccess = Boolean(signature && transaction?.key && !transactionError);
  const isError = Boolean(transactionError);

  return (
    <Wrapper>
      <Section>
        <Header>
          Swappy swap
          <CloseWrapper onClick={handleCloseClick}>
            <CloseIcon name="close" />
          </CloseWrapper>
          <DateHeader />
        </Header>
      </Section>
      <TransactionProgress
        isError={isError}
        isProcessing={isProcessing}
        isSuccess={isSuccess}
        isExecuting={isExecuting}
        label={'Swap status:'}
      />
      <Section>
        <FeesOriginal
          userTokenAccounts={userTokenAccounts}
          feeCompensationInfo={feeCompensationInfo}
          feeLimitsInfo={feeLimitsInfo}
          solanaProvider={solanaProvider}
          networkFees={networkFees}
          priceInfo={priceInfo}
          swapInfo={swapInfo}
          forPage={false}
        />
      </Section>
      <SolanaExplorerLink
        signature={signature}
        network={network}
        amplitudeAction={{
          // @ts-ignore
          name: 'swap_explorer_click',
          // @ts-ignore
          data: { transactionConfirmed: !isExecuting },
        }}
      />
    </Wrapper>
  );
};
