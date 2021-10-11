import { styled } from '@linaria/react';

import { TextField } from 'components/ui';

export const Description = styled.div`
  padding: 16px 24px;
`;

export const TextFieldStyled = styled(TextField)`
  margin-bottom: 8px;
`;

export const BottomInfo = styled.div`
  display: flex;

  justify-content: center;
  padding: 15px 20px;

  font-weight: 600;
  font-size: 14px;
  line-height: 140%;

  border-top: 1px solid #f6f6f8;
`;

export const ExplorerA = styled.a`
  color: #a3a5ba;

  &:hover {
    color: #458aff;
  }
`;

export const UsernameAddressWidgetWrapper = styled.div`
  margin-bottom: 16px;
  padding: 0 24px;
`;
