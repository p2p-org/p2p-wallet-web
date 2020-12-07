import React, { FunctionComponent, useCallback, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

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

const Box = styled.div`
  max-width: 364px;
  margin: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  margin: 100px 0 16px;

  color: #000;
  font-weight: 600;
  font-size: 28px;
  line-height: 34px;
  text-align: center;
`;

const Text = styled.div`
  margin-bottom: 8px;

  color: #000;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
`;

const TextWithCover = styled.div`
  margin: 20px 0 16px;
  padding: 20px;

  color: #000;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: left;

  background: #f5f5f5;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 15px;
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
  margin-top: 32px;

  color: #fff;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;

  background: #000;
`;

const SubTitle = styled.div`
  margin: 24px 0 12px;

  color: #000;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  text-align: left;

  opacity: 0.5;
`;

const InputSeed = styled.textarea`
  height: 72px;
  margin-bottom: 24px;
  padding: 16px;

  border: 1px solid #d2d2d2;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 15px;
  outline: none !important;
`;

const Label = styled.label`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
`;

const BoldText = styled.p`
  font-weight: 500;
`;

export const Create: FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isAgreed, setIsAgreed] = useState(false);

  const [mnemonic] = useState(bip39.generateMnemonic());

  const handleContinueClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword === confirmPassword) {
      setPassword(newPassword);
      setIsFirstStep(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    batch(async () => {
      dispatch(selectType(WalletType.MANUAL));
      await dispatch(connect({ mnemonic, password }));

      setTimeout(() => {
        history.push('/wallets');
      }, 100);
    });
  };

  const handleChangeNewPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };
  const handleChangeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  return (
    <Wrapper>
      <Header />
      <Box>
        {isFirstStep ? (
          <Form onSubmit={handleSubmit}>
            <Title>Create Password (Optional)</Title>
            <Text>
              Create password to protect your wallet. It’s will be used for security actions
              confirmation and for editing your profile info.
            </Text>

            <SubTitle>Create password</SubTitle>
            <Input
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={handleChangeNewPassword}
              // postfix={
              //   <EyeIcon name="eye" onclick={handleVisibility} />
              // }
            />

            <SubTitle>Confirm password </SubTitle>
            <Input
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleChangeConfirmPassword}
              // postfix={
              //   <EyeIcon name="eye" onclick={handleVisibility} />
              // }
            />

            <ContinueButton onClick={handleContinueClick} disabled={error}>
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
              these words to restore your wallet if your browser’s storage is cleared or your device
              is damaged or lost.
            </TextWithCover>

            <InputSeed name="mnemonic" value={mnemonic} readOnly={!!mnemonic} />

            <div>
              <Label>
                <input
                  type="checkbox"
                  name="agree"
                  checked={isAgreed}
                  onChange={() => setIsAgreed(!isAgreed)}
                />{' '}
                I have saved these words in a safe place.
              </Label>
            </div>

            <ContinueButton type="submit" disabled={!isAgreed}>
              Continue
            </ContinueButton>

            <LinkStyled to="/access">Already have wallet? Access it</LinkStyled>
          </Form>
        )}
      </Box>
    </Wrapper>
  );
};
