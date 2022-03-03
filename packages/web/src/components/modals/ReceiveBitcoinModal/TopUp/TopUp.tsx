import type { FC } from 'react';
import { useHistory } from 'react-router';

import type { ModalPropsType } from 'app/contexts';
import { ButtonCancel } from 'components/common/ButtonCancel';
import { Button } from 'components/ui';
import { trackEvent } from 'utils/analytics';

import { List, Row, Section, WrapperModal } from '../common/styled';

type Props = ModalPropsType;

export const TopUp: FC<Props> = ({ close }) => {
  const history = useHistory();

  const handleTopUpClick = () => {
    trackEvent('Receive_Topping_Up');

    close(false);
    history.push('/buy');
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
          <Button primary onClick={handleTopUpClick}>
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
