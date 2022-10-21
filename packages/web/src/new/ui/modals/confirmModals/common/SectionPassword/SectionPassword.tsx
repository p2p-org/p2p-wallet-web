import type { FC } from 'react';
import { useLayoutEffect, useState } from 'react';

import { styled } from '@linaria/react';
import {
  DEFAULT_WALLET_PROVIDERS,
  DefaultWalletType,
  useTryUnlockSeedAndMnemonic,
  useWallet,
} from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';

import { ErrorHint } from 'new/ui/components/common/ErrorHint';
import { PasswordInput } from 'new/ui/components/common/PasswordInput';
import { Section } from 'new/ui/modals/confirmModals/common/styled';

const SubTitle = styled.span`
  display: flex;
  margin-bottom: 8px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const PasswordInputStyled = styled(PasswordInput)`
  height: 46px;
`;

interface Props {
  onChange: (flag: boolean) => void;
}

// TODO: remake it during auth reimplementation
export const SectionPassword: FC<Props> = ({ onChange }) => {
  const { walletProviderInfo } = useWallet();
  const tryUnlockSeedAndMnemonic = useTryUnlockSeedAndMnemonic();

  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);

  const isSecretKeyWallet =
    walletProviderInfo?.name === DEFAULT_WALLET_PROVIDERS[DefaultWalletType.SecretKey].name;

  useLayoutEffect(() => {
    onChange(isSecretKeyWallet && (!password || hasError));
  }, [hasError, isSecretKeyWallet, onChange, password]);

  const validatePassword = async (value: string) => {
    try {
      await tryUnlockSeedAndMnemonic(value);
      setHasError(false);
    } catch (error) {
      setHasError(true);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (value) {
      void validatePassword(value);
    }
  };

  if (!isSecretKeyWallet) {
    return null;
  }

  return (
    <Section className="password">
      <SubTitle>Enter password to confirm</SubTitle>
      <PasswordInputStyled value={password} onChange={handlePasswordChange} isError={hasError} />
      {hasError ? <ErrorHint error="The password is not correct" noIcon /> : null}
    </Section>
  );
};
