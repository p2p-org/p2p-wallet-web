import type { FC, ReactElement } from 'react';

import type { ModalPropsType } from 'new/ui/managers/ModalManager';
import { Modal } from 'new/ui/modals/Modal';

type Props = {
  items: ReactElement[];
  title?: string;
};

export const SelectListMobileModal: FC<ModalPropsType & Props> = ({ items, close, title }) => {
  return (
    <Modal noDelimiter={false} close={close} title={title}>
      {items}
    </Modal>
  );
};
