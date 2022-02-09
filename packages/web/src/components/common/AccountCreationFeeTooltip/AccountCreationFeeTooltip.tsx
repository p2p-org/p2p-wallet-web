import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Icon, Tooltip } from 'components/ui';

const QustionIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  margin-left: 4px;

  color: ${theme.colors.textIcon.secondary};
`;

const TooltipContent = styled.div`
  max-width: 296px;
`;

export const AccountCreationFeeTooltip: FC = () => (
  <Tooltip title={<QustionIcon name="info" />}>
    <TooltipContent>
      This value is calculated by subtracting the account creation fee from your balance
    </TooltipContent>
  </Tooltip>
);
