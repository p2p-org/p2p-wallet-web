import type { FC } from 'react';
import React, { useCallback, useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import { Bitcoin } from '@renproject/chains-bitcoin';
import { Solana } from '@renproject/chains-solana';

import { useSolana } from 'app/contexts/solana';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { ToastManager } from 'components/common/ToastManager';
import { Button, Icon, Switch } from 'components/ui';
import { useRenNetwork } from 'utils/hooks/renBridge/useNetwork';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
`;

const Warning = styled.div`
  display: flex;

  padding: 12px;

  background: rgba(163, 165, 186, 0.05);
  border-radius: 12px;
`;

const WarningIconWrapper = styled.div``;

const WarningText = styled.div`
  margin-left: 12px;
`;

const AttentionIcon = styled(Icon)`
  width: 36px;
  height: 36px;
`;

const WarningItems = styled.ul`
  margin: 0 0 16px;

  list-style: square;
`;

const WarningItem = styled.li`
  padding-top: 14px;
`;

const ConfirmWrapper = styled.div`
  display: flex;
  align-items: center;

  margin-bottom: 16px;
  padding: 26px 20px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

const ConfirmText = styled.div`
  flex: 1 1;

  font-weight: 600;
  font-size: 16px;
`;

export const RenGatewayWarning: FC<{ onShowButtonClick: () => void }> = ({ onShowButtonClick }) => {
  const [awaiting, setAwaiting] = useState(false);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [hasSolanaTokenAccount, setSolanaTokenAccount] = useState<any>();
  const solanaProvider = useSolana();
  const network = useRenNetwork();
  const [isConfirm, setIsConfirm] = useState(false);

  useEffect(() => {
    const mount = async () => {
      setIsTokenLoaded(false);
      setSolanaTokenAccount(
        await new Solana(solanaProvider, network).getAssociatedTokenAccount(Bitcoin.asset),
      );
      setIsTokenLoaded(true);
    };

    void mount();
  }, [network, solanaProvider]);

  const createAccount = useCallback(async () => {
    try {
      setAwaiting(true);
      const solanaToken = await new Solana(solanaProvider, network).createAssociatedTokenAccount(
        Bitcoin.asset,
      );
      setSolanaTokenAccount(solanaToken);
    } catch (error) {
      ToastManager.error((error as Error).message);
      console.error(error);
    } finally {
      setAwaiting(false);
    }
  }, [network, solanaProvider]);

  if (!isTokenLoaded) {
    return <LoaderBlock />;
  }

  if (!hasSolanaTokenAccount) {
    return (
      <Wrapper>
        <Warning>
          <WarningIconWrapper>
            <AttentionIcon name="attention" />
          </WarningIconWrapper>
          <WarningText>
            Solana Associated Token Account Required. This will require you to sign a transaction
            and spend some SOL.
          </WarningText>
        </Warning>
        <Button primary disabled={awaiting} onClick={createAccount} style={{ marginTop: '26px' }}>
          Create Token Account
        </Button>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Warning>
        <WarningIconWrapper>
          <AttentionIcon name="attention" />
        </WarningIconWrapper>
        <WarningText>
          Bitcoin deposit address <strong>is only open for 36 hours</strong>, but you can send to it
          multiple times within this session
        </WarningText>
      </Warning>
      <WarningItems>
        <WarningItem>
          Each transaction to this deposit address takes about 60 minutes to complete. For security
          reasons, you will need to wait for 6 block confirmations before you can mint renBTC on
          Solana.
        </WarningItem>
        <WarningItem>
          If you cannot complete this transaction within the required time, please return at a later
          date.
        </WarningItem>
        <WarningItem>
          If you do not finish your transaction within this period/session/time frame,
          <strong> you risk losing the deposits</strong>.
        </WarningItem>
      </WarningItems>
      <ConfirmWrapper>
        <ConfirmText>I can complete this transaction within time</ConfirmText>
        <Switch checked={isConfirm} onChange={() => setIsConfirm(!isConfirm)} />
      </ConfirmWrapper>
      <Button disabled={!isConfirm} primary onClick={onShowButtonClick}>
        Show address
      </Button>
    </Wrapper>
  );
};
