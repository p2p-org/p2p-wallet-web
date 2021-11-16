import { styled } from '@linaria/react';

export const Line = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 12px 20px;

  &.topBorder {
    border-top: 1px solid #f6f6f8;
  }
`;

export const Label = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
`;

export const Value = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 4px;

  font-weight: 600;
  font-size: 16px;
`;
