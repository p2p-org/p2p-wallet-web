import type { FC } from 'react';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';

import { styled } from '@linaria/react';

import type { LayoutViewModel } from 'new/ui/components/common/Layout/Layout.ViewModel';
import type { ModalPropsType } from 'new/ui/managers/ModalManager';
import { ActionButton } from 'new/ui/modals/ActionsMobileModal/ActionButton';
import { Modal } from 'new/ui/modals/Modal';

const Content = styled.div`
  display: grid;
  grid-gap: 25px;

  padding: 18px 0;
`;

interface Props {
  layoutViewModel: LayoutViewModel;
}

export const ActionsMobileModal: FC<Props & ModalPropsType> = ({ close, layoutViewModel }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleButtonClick = (route: string) => () => {
    close(false);

    if (location.pathname !== route) {
      navigate(route, { state: { fromPage: location.pathname } });
    }
  };

  const handleBuyButtonClick = () => {
    close(false);
    layoutViewModel.openChooseBuyTokenMobileModal();
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
