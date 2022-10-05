import type { FC } from 'react';
import { useMemo } from 'react';

import * as bip39 from 'bip39';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { AuthVewModel } from 'new/scenes/Main/Auth/Auth.VewModel';
import { CommonLayout } from 'new/scenes/Main/Auth/Subviews/components/CommonLayout';
import { Mnemonic } from 'new/scenes/Main/Auth/Subviews/components/MnemonicInput';
import { WizardSteps } from 'new/scenes/Main/Auth/typings';

const MNEMONIC_STRENGTH = 256;

export const CreateMnemonicStep: FC = () => {
  const mnemonic = useMemo(() => bip39.generateMnemonic(MNEMONIC_STRENGTH), []);
  const viewModel = useViewModel(AuthVewModel);

  return (
    <CommonLayout>
      <Mnemonic
        mnemonic={mnemonic}
        next={() => viewModel.setStep(WizardSteps.CREATE_CONFIRM_MNEMONIC)}
      />
    </CommonLayout>
  );
};

export default CreateMnemonicStep;
