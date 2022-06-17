import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { AmountUSD } from './AmountUSD';

export const AmountUSDStyled = styled(AmountUSD)`
  margin-left: 8px;

  color: ${theme.colors.textIcon.secondary};
`;
