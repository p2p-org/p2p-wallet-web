import type { FC } from 'react';
import { useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { ErrorHint } from 'components/common/ErrorHint';
import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { AuthViewModel } from '../../Auth.ViewModel';
import { Button } from './Button';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PasteMnemonic = styled.span`
  margin: 32px 0 8px;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const PasteMnemonicHint = styled.span`
  color: #161616;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;
`;

const MnemonicWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0 32px;
`;

const MnemonicTextarea = styled.textarea`
  position: relative;

  width: 100%;
  height: 100%;
  min-height: 130px;
  padding: 15px;

  color: #161616;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;

  background: #f6f6f8;
  border: 1px solid transparent;
  border-radius: 12px;
  outline: 0;

  &:focus {
    background: #fff;
    border-color: #5887ff;
  }

  &::placeholder {
    color: #1616164c;
  }

  &.hasError {
    border-color: #f43d3d;
  }
`;

export const ConfirmMnemonic: FC = observer(() => {
  const viewModel = useViewModel(AuthViewModel);
  const [userMnemonic, setUserMnemonic] = useState('');
  const [hasError, setHasError] = useState(false);

  const validateMnemonic = (value: string) => {
    setHasError(value !== viewModel.authInfo.mnemonic);
  };

  const handleMnemonicInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserMnemonic(e.target.value);

    validateMnemonic(e.target.value.trim());
  };

  const handleMnemonicBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.trim();
    setUserMnemonic(value);
    validateMnemonic(value);
  };

  const isNextDisabled = userMnemonic.trim() !== viewModel.authInfo.mnemonic || hasError;

  return (
    <Wrapper>
      <PasteMnemonic>Paste your seed phrase</PasteMnemonic>
      <PasteMnemonicHint>
        Paste or enter your seed phrase to confirm that you’ve stored it safely. If you lose it you
        will lost access to your wallet.
      </PasteMnemonicHint>
      <MnemonicWrapper>
        <MnemonicTextarea
          placeholder="Seed phrase"
          value={userMnemonic}
          onInput={handleMnemonicInput}
          onBlur={handleMnemonicBlur}
          className={classNames({ hasError })}
        />
        {hasError ? <ErrorHint error="Incorrect seed phrase" /> : undefined}
      </MnemonicWrapper>
      <Button disabled={isNextDisabled} onClick={viewModel.nextStep}>
        Continue
      </Button>
    </Wrapper>
  );
});
