import React, { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import * as bip39 from 'bip39';
import { styled } from 'linaria/react';
import throttle from 'lodash.throttle';

import { createAccount } from 'store/actions/complex/blockchain';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
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

export const Access: FunctionComponent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [password, setPassword] = useState(
    'galaxy lend nose glow equip student way hockey step dismiss expect silent',
  );

  const validatePassword = useCallback(
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
    if (password.length === 0) {
      return;
    }

    dispatch(createAccount(password));

    setTimeout(() => {
      navigate('/dashboard');
    }, 10);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextPassword: string = e.target.value.trim();

    validatePassword(nextPassword);
    setPassword(nextPassword);
  };

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit}>
        <h1>Access Wallet</h1>
        <input name="password" value={password} onChange={handleChange} />
        <button type="submit" disabled={error}>
          Submit
        </button>
        <LinkStyled to="/create">Create Wallet</LinkStyled>
      </Form>
    </Wrapper>
  );
};
