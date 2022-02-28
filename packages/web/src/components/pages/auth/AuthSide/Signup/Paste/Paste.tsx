import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { ErrorHint } from 'components/common/ErrorHint';
import { Button } from 'components/pages/auth/AuthSide/common/Button';
import { trackEvent } from 'utils/analytics';
import { useTrackEventOnce } from 'utils/hooks/useTrackEventOnce';

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

interface Props {
  mnemonic: string;
  next: () => void;
}

export const Paste: FC<Props> = ({ mnemonic, next }) => {
  const mnemonicRef = useRef<HTMLTextAreaElement | null>(null);
  const trackEventOnce = useTrackEventOnce();
  const [userMnemonic, setUserMnemonic] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    trackEvent('signup_paste_seed_open');
  }, []);

  useEffect(() => {
    if (mnemonicRef.current) {
      mnemonicRef.current.style.height = 'inherit';
      mnemonicRef.current.style.height = `${mnemonicRef.current.scrollHeight}px`;
    }
  }, [mnemonic]);

  const validateMnemonic = (value: string) => {
    setHasError(value !== mnemonic);
  };

  const handleMnemonicInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    const valueTrimmed = value.trim();

    if (valueTrimmed === mnemonic) {
      setUserMnemonic(valueTrimmed);
    } else {
      setUserMnemonic(value);
    }

    validateMnemonic(valueTrimmed);
    trackEventOnce('signup_seed_pasted');
  };

  const handleMnemonicBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.trim();
    setUserMnemonic(value);
    validateMnemonic(value);
  };

  const handleContinueClick = () => {
    trackEvent('signup_continue_paste_click');
    next();
  };

  const isDisabled = userMnemonic !== mnemonic || hasError;

  return (
    <Wrapper>
      <PasteMnemonic>Paste your seed phrase</PasteMnemonic>
      <PasteMnemonicHint>
        Paste or enter your seed phrase to confirm that you’ve stored it safely. If you lose it you
        will lost access to your wallet.
      </PasteMnemonicHint>
      <MnemonicWrapper>
        <MnemonicTextarea
          ref={mnemonicRef}
          placeholder="Seed phrase"
          value={userMnemonic}
          onInput={handleMnemonicInput}
          onBlur={handleMnemonicBlur}
          className={classNames({ hasError })}
        />
        {hasError ? <ErrorHint error="Incorrect seed phrase" /> : undefined}
      </MnemonicWrapper>
      <Button disabled={isDisabled} onClick={handleContinueClick}>
        Continue
      </Button>
    </Wrapper>
  );
};
