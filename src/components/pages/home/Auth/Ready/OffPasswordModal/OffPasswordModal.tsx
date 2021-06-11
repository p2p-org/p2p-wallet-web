import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { Modal } from 'components/common/Modal';

const WrapperModal = styled(Modal)`
  flex-basis: 588px;
`;

type Props = {
  close: () => void;
};

export const OffPasswordModal: FC<Props> = ({ close }) => {
  return (
    <WrapperModal title="Add coins" close={close}>
      1
    </WrapperModal>
  );
};
