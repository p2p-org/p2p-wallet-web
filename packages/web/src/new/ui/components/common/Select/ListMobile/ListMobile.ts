import type { FC } from 'react';
import { useEffect } from 'react';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { ModalType } from 'new/services/ModalService';
import { ListMobileViewModel } from 'new/ui/components/common/Select/ListMobile/ListMobile.ViewModel';

type Props = {
  title?: string;
  onCloseByWrapper: () => void;
};

export const ListMobile: FC<Props> = ({ children, title, onCloseByWrapper }) => {
  const viewModel = useViewModel(ListMobileViewModel);

  useEffect(() => {
    const modalPromise = viewModel.openModal<{ closedByItem?: boolean }>(
      ModalType.SHOW_MODAL_SELECT_LIST_MOBILE,
      {
        items: children,
        title,
      },
    );
    const { modalId } = modalPromise;

    modalPromise.then((result) => {
      if (result && result.closedByItem) {
        return;
      }

      onCloseByWrapper();
    });

    return () => {
      viewModel.closeModal(modalId, { closedByItem: true });
    };
  }, []);

  return null;
};
