import type { FC } from 'react';
import { useState } from 'react';

import type { TokenAccount } from '@p2p-wallet-web/core';
import { useSolana, useUserTokenAccounts } from '@p2p-wallet-web/core';
import { Bitcoin } from '@renproject/chains-bitcoin';
import { Solana } from '@renproject/chains-solana';
import type { Token } from '@saberhq/token-utils';
import { Feature } from 'flagged';

import type { ModalPropsType } from 'app/contexts';
import { FeePaySelector } from 'components/common/FeePaySelector';
import { ToastManager } from 'components/common/ToastManager';
import { Button, ButtonCancel } from 'components/ui';
import { FEATURE_PAY_BY } from 'config/featureFlags';
import { useRenNetwork } from 'utils/hooks/renBridge/useNetwork';

import { List, Row, Section, WrapperModal } from '../common/styled';

type Props = ModalPropsType;

export const Create: FC<Props> = ({ close }) => {
  const solanaProvider = useSolana();
  const network = useRenNetwork();
  const tokenAccounts = useUserTokenAccounts();

  // TODO: use for progress bar in Modal. Add this feature to modal
  const [creating, setCreating] = useState(false);

  const handleFeeTokenAccountChange = (
    _nextToken: Token,
    nextTokenAccount: TokenAccount | null,
  ) => {
    if (!nextTokenAccount?.key) {
      return;
    }
  };

  const handleCreateAccountClick = async () => {
    try {
      setCreating(true);
      await new Solana(solanaProvider, network).createAssociatedTokenAccount(Bitcoin.asset);
      close(true);
    } catch (error) {
      ToastManager.error((error as Error).message);
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <WrapperModal
      title="Receiving via Bitcoin network"
      description="Make sure you understand these aspects"
      iconName="clock"
      iconBgClassName="warning"
      close={() => close(false)}
      footer={
        <>
          <Button primary onClick={handleCreateAccountClick}>
            Pay 0.002928 SOL & Continue
          </Button>
          <ButtonCancel onClick={() => close(false)} />
        </>
      }
    >
      <Section>
        <List>
          <Row>
            Your wallet list does not contain a renBTC account, and to create one{' '}
            <strong>you need to make a transaction</strong>. You can choose which currency to pay in
            below.
          </Row>
        </List>

        <Feature name={FEATURE_PAY_BY}>
          <FeePaySelector
            tokenAccounts={tokenAccounts}
            onTokenAccountChange={handleFeeTokenAccountChange}
            isShortList
          />
        </Feature>

        <List>
          <Row>
            This address accepts <strong>only Bitcoin</strong>. You may lose assets by sending
            another coin.
          </Row>
          <Row>
            You will receive <strong>renBTC</strong>.
          </Row>
          <Row>
            Bitcoin deposit address is only open for 36 hours, but you can send to it multiple times
            within this session
          </Row>
        </List>
      </Section>
    </WrapperModal>
  );
};
