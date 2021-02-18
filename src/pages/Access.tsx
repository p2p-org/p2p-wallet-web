import React, { FunctionComponent, useCallback, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { styled } from '@linaria/react';
import * as bip39 from 'bip39';
import throttle from 'lodash.throttle';

import { WalletType } from 'api/wallet';
import { LayoutUnauthed } from 'components/common/LayoutUnauthed';
import { Button, Input } from 'components/ui';
import { localMnemonic } from 'config/constants';
import { connect, selectType } from 'store/slices/wallet/WalletSlice';

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  margin: 100px 0 32px;

  color: #000;
  font-weight: 500;
  font-size: 27px;
  line-height: 120%;
  text-align: center;
`;

const SubTitle = styled.div`
  margin-bottom: 12px;

  color: #000;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  text-align: left;

  opacity: 0.5;
`;

const CreateButton = styled(Button)`
  margin-top: 32px;
`;

const TextareaSeed = styled.textarea`
  height: 72px;
  margin-bottom: 24px;
  padding: 16px;

  border: 1px solid #d2d2d2;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 15px;
  outline: none !important;
`;

// const EyeIcon = styled(Icon)`
//   width: 24px;
//   height: 24px;
//
//   opacity: 0.5;
// `;

export const Access: FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [mnemonic, setMnemonic] = useState(localMnemonic || '');
  const [password, setPassword] = useState('');

  const validateMnemonic = useCallback(
    throttle(
      (nextPassword: string) => {
        if (bip39.validateMnemonic(nextPassword)) {
          setError(false);
        } else if (!error) {
          setError(true);
        }
      },
      100,
      { leading: false },
    ),
    [],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mnemonic.length === 0) {
      return;
    }

    batch(async () => {
      dispatch(selectType(WalletType.MANUAL));
      await dispatch(connect({ mnemonic, password }));

      setTimeout(() => {
        history.push('/wallets');
      }, 100);
    });
  };

  const handleMnemonicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextMnemonic = e.target.value;
    validateMnemonic(nextMnemonic);
    setMnemonic(nextMnemonic);
  };

  const handlePasswordChange = (value: string) => {
    const nextPassword = value.trim();
    setPassword(nextPassword);
  };

  // const handleVisibility = () => {};

  const isDisabled = error || !mnemonic;

  return (
    <LayoutUnauthed>
      <Form onSubmit={handleSubmit}>
        <Title>Access Wallet</Title>

        <SubTitle>Enter your Seed, to get access to wallet </SubTitle>
        <TextareaSeed name="mnemonic" value={mnemonic} onChange={handleMnemonicChange} />

        <SubTitle>Enter Password (optional) </SubTitle>
        <Input
          name="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          // postfix={<EyeIcon name="eye" onClick={handleVisibility} />}
        />

        <CreateButton type="submit" primary big disabled={isDisabled}>
          Continue
        </CreateButton>
      </Form>
    </LayoutUnauthed>
  );
};
