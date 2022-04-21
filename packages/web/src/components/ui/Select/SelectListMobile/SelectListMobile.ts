import type { FC } from 'react';
import { useEffect } from 'react';

import { ModalType, useModals } from 'app/contexts';

type Props = {
  title?: string;
};

export const SelectListMobile: FC<Props> = ({ children, title }) => {
  const { openModal, closeModal } = useModals();

  useEffect(() => {
    const modalPromise = openModal(ModalType.SHOW_MODAL_SELECT_LIST_MOBILE, {
      items: children,
      title,
    });

    return () => {
      closeModal(modalPromise.modalId);
    };
  }, []);

  return null;
};
