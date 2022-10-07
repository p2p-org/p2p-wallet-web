import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { ErrorHint } from 'components/common/ErrorHint';
import { PasswordInput } from 'components/common/PasswordInput';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { AuthVewModel } from 'new/scenes/Main/Auth/Auth.VewModel';

import { validatePassword } from '../../utils';
import { Button } from './Button';

// @FIXME rewrite all hex colors to palette
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

const RulesWrapper = styled.div``;

const StepsWrappers = styled.div`
  display: flex;
  margin: 12px 0;
`;

const Step = styled.div`
  flex: 1;
  height: 3px;

  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;

  &.red {
    background: #f43d3d;
    opacity: 0.8;
  }

  &.orange {
    background: #ffa631;
    opacity: 0.8;
  }

  &.green {
    background: #77db7c;
    opacity: 0.8;
  }

  &.blue {
    background: #5887ff;
  }

  &:not(:last-child) {
    margin-right: 8px;
  }
`;

const RulesList = styled.ul`
  margin: 0;
  padding-left: 22px;
`;

const Rule = styled.li`
  color: #161616;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;

  opacity: 0.3;

  &.done {
    text-decoration: line-through;
  }

  &:not(:last-child) {
    margin-bottom: 12px;
  }
`;

const RepeatPassword = styled(SubTitle)`
  margin: 20px 0 12px;
`;

const ButtonStyled = styled(Button)`
  margin-top: 32px;
`;

export const Password: FC = observer(() => {
  const viewModel = useViewModel(AuthVewModel);
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [hasPasswordRepeatError, setHasPasswordRepeatError] = useState(false);

  const { isLowerCase, isUpperCase, isNumber, isMinLength } = validatePassword(
    viewModel.authInfo.password,
  );

  const handlePasswordRepeatChange = (value: string) => {
    setPasswordRepeat(value);

    if (hasPasswordRepeatError) {
      setHasPasswordRepeatError(viewModel.authInfo.password !== value);
    }
  };

  const handlePasswordRepeatBlur = () => {
    setHasPasswordRepeatError(viewModel.authInfo.password !== passwordRepeat);
  };

  const elRules = () => {
    if (!viewModel.authInfo.password) {
      return;
    }

    const counter = [isLowerCase, isUpperCase, isNumber, isMinLength].reduce(
      (prev, curr) => (curr ? prev + 1 : prev),
      0,
    );

    return (
      <RulesWrapper>
        <StepsWrappers>
          {new Array(counter).fill(null).map((_, index) => {
            return (
              <Step
                key={index}
                className={classNames({
                  red: counter === 1,
                  orange: counter === 2,
                  green: counter === 3,
                  blue: counter === 4,
                })}
              />
            );
          })}
          {new Array(4 - counter).fill(null).map((_, index) => (
            <Step key={index} />
          ))}
        </StepsWrappers>
        <RulesList>
          <Rule className={classNames({ done: isUpperCase })}>One uppercase letter</Rule>
          <Rule className={classNames({ done: isLowerCase })}>One lowercase letter</Rule>
          <Rule className={classNames({ done: isNumber })}>One number</Rule>
          <Rule className={classNames({ done: isMinLength })}>8+ characters</Rule>
        </RulesList>
      </RulesWrapper>
    );
  };

  const disabled =
    !viewModel.authInfo.password ||
    !isLowerCase ||
    !isUpperCase ||
    !isNumber ||
    !isMinLength ||
    viewModel.authInfo.password !== passwordRepeat;

  return (
    <Wrapper>
      <CreatePassword>Create password</CreatePassword>
      <CreatePasswordHint>
        Create a password to protect your wallet. It will be used for security actions,
        confirmations and for editing your profile info.
      </CreatePasswordHint>
      <PasswordInput
        placeholder="Create new password"
        value={viewModel.authInfo.password}
        onChange={viewModel.setPassword}
        isError={false}
      />
      {elRules()}
      <RepeatPassword>Repeat password</RepeatPassword>
      <PasswordInput
        placeholder="Repeat new password"
        value={passwordRepeat}
        onChange={handlePasswordRepeatChange}
        onBlur={handlePasswordRepeatBlur}
        className={classNames({ error: hasPasswordRepeatError })}
        isError={false}
      />
      {hasPasswordRepeatError ? <ErrorHint error="Passwords doesn’t match" /> : undefined}
      <ButtonStyled disabled={disabled} onClick={viewModel.nextStep}>
        Continue
      </ButtonStyled>
    </Wrapper>
  );
});
