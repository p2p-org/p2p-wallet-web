import type { FC, ReactElement } from 'react';

import { Modal } from 'new/ui/modals/Modal';
import type { ModalPropsType } from 'new/ui/modals/ModalManager';

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
