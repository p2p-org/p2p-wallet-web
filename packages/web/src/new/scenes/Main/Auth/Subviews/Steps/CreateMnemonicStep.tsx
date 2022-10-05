import type { FC } from 'react';

import { CommonLayout } from 'new/scenes/Main/Auth/Subviews/components/CommonLayout';
import { Mnemonic } from 'new/scenes/Main/Auth/Subviews/components/MnemonicInput';

export const CreateMnemonicStep: FC = () => {
  return (
    <CommonLayout>
      <Mnemonic />
    </CommonLayout>
  );
};

export default CreateMnemonicStep;
