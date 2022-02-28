import { styled } from '@linaria/react';

export const StatusItem = styled.li`
  display: flex;
  align-items: center;

  padding: 12px 0;

  border-bottom: 1px solid #f6f6f8;

  &:nth-last-child() {
    border-bottom: none;
  }
`;

export const Status = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const StatusTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

export const StatusAction = styled.div``;
