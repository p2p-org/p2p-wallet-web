import type { FC } from 'react';
import { useEffect } from 'react';

import { ModalType, useModals } from 'app/contexts';

type Props = {
  title?: string;
  onCloseByWrapper: () => void;
};

export const SelectListMobile: FC<Props> = ({ children, title, onCloseByWrapper }) => {
  const { openModal, closeModal } = useModals();

  useEffect(() => {
    const modalPromise = openModal(ModalType.SHOW_MODAL_SELECT_LIST_MOBILE, {
      items: children,
      title,
    });
    const { modalId } = modalPromise;

    modalPromise.then((result) => {
      if (result && result.closedByItem) {
        return;
      }

      onCloseByWrapper();
    });

    return () => {
      closeModal(modalId, { closedByItem: true });
    };
  }, []);

  return null;
};
