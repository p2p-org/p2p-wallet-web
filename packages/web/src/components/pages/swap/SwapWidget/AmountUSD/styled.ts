import { styled } from '@linaria/react';

import { AmountUSD } from './AmountUSD';

export const AmountUSDStyled = styled(AmountUSD)`
  &::before {
    content: '(';
  }

  &::after {
    content: ')';
  }

  margin-left: 8px;

  color: #8e8e93;
`;
