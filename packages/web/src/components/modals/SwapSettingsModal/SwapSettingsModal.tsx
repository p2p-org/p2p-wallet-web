import type { FC } from 'react';

import type { ModalPropsType } from 'app/contexts/general/modals/types';
import { Modal } from 'components/ui/Modal';

interface Props {}

export const SwapSettingsModal: FC<Props & ModalPropsType> = ({ close }) => {
  return <Modal close={close}>123123</Modal>;
};
