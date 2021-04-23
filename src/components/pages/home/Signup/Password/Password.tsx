import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';

import { Button } from '../../common/Button';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  margin-top: 32px;
`;

const SubTitle = styled.span`
  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const CreatePassword = styled(SubTitle)`
  margin-bottom: 8px;
`;

const CreatePasswordHint = styled.span`
  margin-bottom: 20px;

  color: #161616;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;
`;

const Input = styled.input`
  height: 54px;
  padding-left: 50px;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 22px;

  background: #f6f6f8 url('./lock.svg') no-repeat 15px 50%;
  border: none;
  border-radius: 12px;
  outline: none;

  appearance: none;

  &::placeholder {
    color: #1616164c;
    font-weight: 400;
  }
`;

const RepeatPassword = styled(SubTitle)`
  margin: 24px 0 12px;
`;

const ButtonStyled = styled(Button)`
  margin-top: 32px;
`;

type Props = {
  next: (password: string) => void;
};

export const Password: FC<Props> = ({ next }) => {
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPassword(value);
  };

  const handlePasswordRepeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPasswordRepeat(value);
  };

  const handleContinueClick = () => {
    next(password);
  };

  const disabled = !password || password !== passwordRepeat;

  return (
    <Wrapper>
      <CreatePassword>Create password</CreatePassword>
      <CreatePasswordHint>
        Create password to protect your wallet. It’s will be used for security actions confirmations
        and for editing your profile info.
      </CreatePasswordHint>
      <Input
        type="password"
        placeholder="Create new password"
        value={password}
        onChange={handlePasswordChange}
      />
      <RepeatPassword>Repeat password</RepeatPassword>
      <Input
        type="password"
        placeholder="Repeat new password"
        value={passwordRepeat}
        onChange={handlePasswordRepeatChange}
      />
      <ButtonStyled disabled={disabled} onClick={handleContinueClick}>
        Continue
      </ButtonStyled>
    </Wrapper>
  );
};
