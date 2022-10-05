import type { FC } from 'react';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { AuthVewModel } from 'new/scenes/Main/Auth/Auth.VewModel';
import { CommonLayout } from 'new/scenes/Main/Auth/Subviews/components/CommonLayout';
import { ConfirmMnemonic } from 'new/scenes/Main/Auth/Subviews/components/ConfirmMnemonic';

export const ConfirmMnemonicStep: FC = () => {
  const viewModel = useViewModel(AuthVewModel);

  return (
    <CommonLayout>
      <ConfirmMnemonic mnemonic={viewModel.authInfo.mnemonic as string} next={() => null} />
    </CommonLayout>
  );
};

export default ConfirmMnemonicStep;
