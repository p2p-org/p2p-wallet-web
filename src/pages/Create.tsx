import React, { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import * as bip39 from 'bip39';
import { styled } from 'linaria/react';

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

export const Create: FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [password, setPassword] = useState(bip39.generateMnemonic());

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length === 0) {
      return;
    }

    dispatch(createAccount(password));

    setTimeout(() => {
      history.push('/wallets');
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit}>
        <h1>Create Wallet</h1>
        <input name="password" value={password} onChange={handleChange} />
        <button type="submit">Submit</button>
        <LinkStyled to="/access">Access Wallet</LinkStyled>
      </Form>
    </Wrapper>
  );
};
