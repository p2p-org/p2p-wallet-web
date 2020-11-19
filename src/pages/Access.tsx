import React, { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import * as bip39 from 'bip39';
import { styled } from 'linaria/react';
import throttle from 'lodash.throttle';

import { Button, Icon, Input } from 'components/ui';
import { accessAccount } from 'store/actions/complex/blockchain';

import { Header } from '../components/common/Header';

// const Wrapper = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   height: 100vh;
// `;

const Wrapper = styled.div`
  background: #fff;
  height: 100%;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const LinkStyled = styled(Link)`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const Title = styled.div`
  color: #000;
  font-weight: 500;
  font-size: 27px;
  line-height: 120%;
  text-align: center;
  margin-top: 100px;
  margin-bottom: 32px;
`;

const SubTitle = styled.div`
  color: #000;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  text-align: left;
  margin-bottom: 12px;
  opacity: 0.5;
`;

const CreateButton = styled(Button)`
  width: 100%;
  height: 56px;
  font-weight: 500;
  color: #fff;
  background: #000;
  line-height: 17px;
  size: 14px;
  font-style: normal;
  margin-top: 32px;
`;

const Box = styled.div`
  margin: auto;
  max-width: 364px;
`;

const InputSeed = styled.textarea`
  height: 72px;
  margin-bottom: 24px;
  outline: none !important;
  border: 1px solid #d2d2d2;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 15px;
  padding: 16px;
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
    dispatch(accessAccount(mnemonic));
    setTimeout(() => {
      history.push('/wallets');
    }, 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextMnemonic: string = e.target.value;
    validateMnemonic(nextMnemonic);
    setMnemonic(nextMnemonic);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextPassword: string = e.target.value.trim();

    setPassword(nextPassword);
  };

  const handleVisibility = () => {};

  return (
    <Wrapper>
      <Header />
      <Box>
        <Form onSubmit={handleSubmit}>
          <Title>Access Wallet</Title>

          <SubTitle>Enter your Seed, to get access to wallet </SubTitle>
          <InputSeed name="mnemonic" value={mnemonic} onChange={handleChange} />

          <SubTitle>Enter Password (optional) </SubTitle>
          <Input
            name="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            // postfix={
            //   <EyeIcon name="eye" onclick={handleVisibility} />
            // }
          />

          <CreateButton type="submit" disabled={error}>
            Continue
          </CreateButton>
        </Form>
      </Box>
    </Wrapper>
  );
};
