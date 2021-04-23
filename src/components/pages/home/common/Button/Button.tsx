import { styled } from '@linaria/react';

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 54px;
  padding: 0 15px;

  color: #f9f9f9;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;

  background: #161616;
  border: none;
  border-radius: 12px;
  outline: none;
  cursor: pointer;

  appearance: none;

  &:disabled {
    background: #1616164c;
  }
`;
