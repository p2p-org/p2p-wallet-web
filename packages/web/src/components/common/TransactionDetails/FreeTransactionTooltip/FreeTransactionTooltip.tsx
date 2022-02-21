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

export const FreeTransactionTooltip: FC<{
  freeTransactionCount?: number;
  currentTransactionCount?: number;
}> = ({ freeTransactionCount = 100, currentTransactionCount = 100 }) => {
  const availableTransactions = freeTransactionCount - currentTransactionCount;

  return (
    <Tooltip title={<InfoIcon name="question" />}>
      <TooltipContent>
        {`On the Solana network, the first ${freeTransactionCount} transactions in a day are paid by P2P.org. You have ${
          availableTransactions > 0 ? availableTransactions : 0
        }
        free transactions left for today.`}
        <br />
        <br /> Subsequent transactions will be charged based on the Solana blockchain gas fee.
      </TooltipContent>
    </Tooltip>
  );
};
