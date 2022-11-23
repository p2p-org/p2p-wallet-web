import type { FC } from 'react';
import { useHistory, useLocation } from 'react-router';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';
import { ButtonCancel } from 'new/ui/components/common/ButtonCancel';
import { Button } from 'new/ui/components/ui/Button';
import type { ModalPropsType } from 'new/ui/managers/ModalManager';

import { List, Row, Section, WrapperModal } from '../common/styled';

const IconStyled = styled(Icon)`
  margin-right: 8px;
`;

export const TopUp: FC<ModalPropsType> = ({ close }) => {
  const history = useHistory();
  const location = useLocation();

  const handleTopUpClick = () => {
    close(false);
    history.push('/buy', { state: { fromPage: location.pathname } });
  };

  return (
    <WrapperModal
      title="Create Bitcoin address"
      iconName="clock"
      iconBgClassName="warning"
      close={() => close(false)}
      footer={
        <>
          <Button primary onClick={handleTopUpClick}>
            <IconStyled name={'plus'} size={24} />
            Top up your account
          </Button>
          <ButtonCancel onClick={() => close(false)} />
        </>
      }
    >
      <Section>
        <List>
          <Row>
            A <strong>renBTC account is required</strong> to receive bitcoins over the Bitcoin
            network.
          </Row>
          <Row>
            Your wallet list does not contain a renBTC account, and to create one{' '}
            <strong>you need to make a transaction</strong>.
          </Row>
          <Row>
            You <strong>don't have funds</strong> to pay for account creation, but if someone sends
            renBTC to your address, it will be created for you.
          </Row>
        </List>
      </Section>
    </WrapperModal>
  );
};
