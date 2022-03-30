import type { FC } from 'react';
import { useHistory, useLocation } from 'react-router';

import { styled } from '@linaria/react';

import type { ModalPropsType } from 'app/contexts';
import { ModalType, useModals } from 'app/contexts';
import { ActionButton } from 'components/modals/ActionsMobileModal/ActionButton';
import { Modal } from 'components/ui/Modal';

const Content = styled.div`
  display: grid;
  grid-gap: 25px;

  padding: 18px 0;
`;

interface Props {}

export const ActionsMobileModal: FC<Props & ModalPropsType> = ({ close }) => {
  const history = useHistory();
  const location = useLocation();
  const { openModal } = useModals();

  const handleButtonClick = (route: string) => () => {
    close(false);
    history.push(route, { fromPage: location.pathname });
  };

  const handleBuyButtonClick = () => {
    openModal(ModalType.SHOW_MODAL_CHOOSE_BUY_TOKEN_MOBILE);
  };

  const handleCloseClick = () => {
    close(false);
  };

  return (
    <Modal close={handleCloseClick} noDelimiter>
      <Content>
        <ActionButton icon="plus" onClick={handleBuyButtonClick}>
          Buy
        </ActionButton>
        <ActionButton icon="bottom" onClick={handleButtonClick('/receive')}>
          Receive
        </ActionButton>
        <ActionButton icon="top" onClick={handleButtonClick('/send')}>
          Send
        </ActionButton>
        <ActionButton icon="swap" onClick={handleButtonClick('/swap')}>
          Swap
        </ActionButton>
      </Content>
    </Modal>
  );
};
