import React, { FunctionComponent, useCallback, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { styled } from '@linaria/react';
import * as bip39 from 'bip39';
import throttle from 'lodash.throttle';

import { WalletType } from 'api/wallet';
import { Button, Icon, Input } from 'components/ui';
import { connect, selectType } from 'features/wallet/WalletSlice';

import { Header } from '../components/common/Header';

const Wrapper = styled.div`
  height: 100%;

  background: #fff;
`;

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
  width: 100%;
  height: 56px;
  margin-top: 32px;

  color: #fff;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;

  background: #000;
`;

const Box = styled.div`
  max-width: 364px;
  margin: auto;
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

const EyeIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  opacity: 0.5;
`;

export const Access: FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextPassword = e.target.value.trim();
    setPassword(nextPassword);
  };

  const handleVisibility = () => {};

  const isDisabled = error || !mnemonic;

  return (
    <Wrapper>
      <Header />
      <Box>
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

          <CreateButton type="submit" disabled={isDisabled}>
            Continue
          </CreateButton>
        </Form>
      </Box>
    </Wrapper>
  );
};
