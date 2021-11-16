import { styled } from '@linaria/react';

export const Toast = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-height: 40px;
  padding: 16px;

  word-break: break-all;
  word-break: break-word;

  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  cursor: initial;

  @media (min-width: 500px) {
    width: 282px;
  }
`;
