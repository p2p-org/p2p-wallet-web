import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Icon, Tooltip } from 'components/ui';

const InfoIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  margin-left: 4px;
`;

const TooltipContent = styled.div`
  max-width: 296px;
`;

export const FreeTransactionTooltip: FC = () => {
  return (
    <Tooltip title={<InfoIcon name="info" />}>
      <TooltipContent>
        On the Solana network, the first 100 transactions in a day are paid by P2P.org. You have 100
        free transactions left for today. <br />
        <br /> Subsequent transactions will be charged based on the Solana blockchain gas fee.
      </TooltipContent>
    </Tooltip>
  );
};
