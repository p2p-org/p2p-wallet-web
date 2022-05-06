import type { FC, ReactElement } from 'react';

import type { ModalPropsType } from 'app/contexts';
import { Modal } from 'components/ui/Modal';

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
