import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';

import { Button, Icon, Switch } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 24px 0;
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
  margin: 0;
  margin-bottom: 16px;

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
  const [isConfirm, setIsConfirm] = useState(false);

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
