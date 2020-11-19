import React, { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import * as bip39 from 'bip39';
import { styled } from 'linaria/react';
import throttle from 'lodash.throttle';

import { Button, Icon, Input } from 'components/ui';
import { createAccount } from 'store/actions/complex/blockchain';

import { Header } from '../components/common/Header';

const Wrapper = styled.div`
  background: #fff;
  height: 100%;
`;

const Box = styled.div`
  margin: auto;
  max-width: 364px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 28px;
  line-height: 34px;
  text-align: center;
  margin-top: 100px;
  margin-bottom: 16px;
`;

const Text = styled.div`
  color: #000;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  margin-bottom: 8px;
`;

const TextWithCover = styled.div`
  color: #000;
  background: #f5f5f5;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  margin-bottom: 20px;
  margin-top: 16px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 15px;
  padding: 20px;
`;

const LinkStyled = styled(Link)`
  display: flex;
  justify-content: center;
  margin-top: 56px;
  color: #000;
  text-decoration: none;
`;

const EyeIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  opacity: 0.5;
`;

const ContinueButton = styled(Button)`
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

const SubTitle = styled.div`
  color: #000;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  text-align: left;
  margin-bottom: 12px;
  margin-top: 24px;
  opacity: 0.5;
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

const Label = styled.label`
  font-weight: 400;
  size: 14px;
  line-height: 20px;
`;

const BoldText = styled.p`
  font-weight: 500;
`;

export const Create: FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  // const [password, setPassword] = useState(bip39.generateMnemonic());
  const [error, setError] = useState(false);
  const [password, setPassword] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [done, toggleForm] = useState(true);
  const [checkbox, toggleCheckbox] = useState(false);

  const [mnemonic, setMnemonic] = useState(bip39.generateMnemonic());

  const handlePasswordInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password1 === password2) {
      setPassword(password1);
      toggleForm(false);
    }
  };

  const validateMnemonic = useCallback(
    throttle(
      (mnemonic: string) => {
        if (bip39.validateMnemonic(mnemonic)) {
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
    const nextMnemonic: string = e.target.value;
    validateMnemonic(nextMnemonic);

    e.preventDefault();
    if (mnemonic.length === 0) {
      return;
    }

    dispatch(createAccount(mnemonic));

    setTimeout(() => {
      history.push('/wallets');
    }, 100);
  };

  const handleChangePassord = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword1(e.target.value);
  };
  const handleChangePassordConfirmation = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword2(e.target.value);
  };

  return (
    <Wrapper>
      <Header />
      <Box>
        {done ? (
          <Form onSubmit={handleSubmit}>
            <Title>Create Password (Optional)</Title>
            <Text>
              Create password to protect your wallet. It’s will be used for security actions
              confirmation and for editing your profile info.
            </Text>

            <SubTitle>Create password</SubTitle>
            <Input
              name="password1"
              type="password"
              value={password1}
              onChange={handleChangePassord}
              // postfix={
              //   <EyeIcon name="eye" onclick={handleVisibility} />
              // }
            />

            <SubTitle>Confirm password </SubTitle>
            <Input
              name="password2"
              type="password"
              value={password2}
              onChange={handleChangePassordConfirmation}
              // postfix={
              //   <EyeIcon name="eye" onclick={handleVisibility} />
              // }
            />

            <ContinueButton onClick={handlePasswordInput} disabled={error}>
              Continue
            </ContinueButton>

            <LinkStyled to="/access">Already have wallet? Access it</LinkStyled>
          </Form>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Title>Create New Wallet</Title>

            <TextWithCover>
              <BoldText>
                Please write down the following twelve words and keep them in a safe place.
              </BoldText>
              Your private keys are only stored on your current computer or device. You will need
              these words to restore your wallet if your browser's storage is cleared or your device
              is damaged or lost.
            </TextWithCover>

            <InputSeed name="mnemonic" value={mnemonic} readOnly={!!mnemonic} />

            <div>
              <input
                type="checkbox"
                id="scales"
                name="scales"
                checked={checkbox}
                onChange={() => toggleCheckbox(!checkbox)}
              />
              <Label htmlFor="scales"> I have saved these words in a safe place.</Label>
            </div>

            <ContinueButton type="submit" disabled={!checkbox}>
              Continue
            </ContinueButton>

            <LinkStyled to="/access">Already have wallet? Access it</LinkStyled>
          </Form>
        )}
      </Box>
    </Wrapper>
  );
};
