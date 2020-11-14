import React, { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import * as bip39 from 'bip39';
import { styled } from 'linaria/react';

import { createAccount } from 'store/actions/complex/blockchain';

import { Button, Input, Icon } from 'components/ui';
import { Header } from '../components/common/Header';




const Wrapper = styled.div``;

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

export const Create: FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  //const [password, setPassword] = useState(bip39.generateMnemonic());
  const [error, setError] = useState(false);
  const [password, setPassword] = useState(
    '',
  );

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

  const handleVisibility = () => {
    console.log("Changing Visibility");
  }

  return (
    <Wrapper>
    <Header />
    <Box>

      <Form onSubmit={handleSubmit}>
        <Title>Create Password</Title>
        <Text>Create password to protect your wallet. It’s will be used for security actions confirmation and for editing your profile info.</Text>
        <SubTitle>Create password</SubTitle>
        <Input name="password" 
                  type="password" 
                  value={password} 
                  onChange={handleChange}
                  postfix={
                    <EyeIcon name="eye" onclick={handleVisibility} />
                  }
          />
          <SubTitle>Confirm password</SubTitle>
          <Input name="password" 
                  type="password" 
                  value={password} 
                  onChange={handleChange}
                  postfix={
                    <EyeIcon name="eye" onclick={handleVisibility} />
                  }
          />
          <CreateButton type="submit" disabled={error}>
             Continue
           </CreateButton>

        <LinkStyled to="/access">Already have wallet? Access it</LinkStyled>
      </Form>
      </Box>
    </Wrapper>
  );
};
