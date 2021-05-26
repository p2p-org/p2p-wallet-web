import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import throttle from 'lodash.throttle';

import { Icon } from 'components/ui';

import { Button } from '../../common/Button';
import { PasswordInput } from '../../common/PasswordInput';

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

const RepeatPassword = styled(SubTitle)`
  margin: 20px 0 12px;
`;

const Error = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;

  color: #f43d3d;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const WarningIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-right: 12px;

  color: #f43d3d;
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
  const [hasPasswordRepeatError, setHasPasswordRepeatError] = useState(false);

  const validatePasswordRepeat = throttle(
    (first, second) => {
      setHasPasswordRepeatError(first !== second);
    },
    100,
    { leading: false, trailing: true },
  );

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPassword(value);
    validatePasswordRepeat(passwordRepeat, value);
  };

  const handlePasswordRepeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPasswordRepeat(value);
    validatePasswordRepeat(password, value);
  };

  const handleContinueClick = () => {
    next(password);
  };

  const disabled = Boolean(password) && password !== passwordRepeat;

  return (
    <Wrapper>
      <CreatePassword>Create password (Optional)</CreatePassword>
      <CreatePasswordHint>
        Create password to protect your wallet. It’s will be used for security actions confirmations
        and for editing your profile info.
      </CreatePasswordHint>
      <PasswordInput
        placeholder="Create new password"
        value={password}
        onChange={handlePasswordChange}
      />
      <RepeatPassword>Repeat password</RepeatPassword>
      <PasswordInput
        placeholder="Repeat new password"
        value={passwordRepeat}
        onChange={handlePasswordRepeatChange}
        className={classNames({ error: hasPasswordRepeatError })}
      />
      {hasPasswordRepeatError ? (
        <Error>
          <WarningIcon name="warning" /> Passwords doesn’t match
        </Error>
      ) : undefined}
      <ButtonStyled disabled={disabled} onClick={handleContinueClick}>
        Continue
      </ButtonStyled>
    </Wrapper>
  );
};
