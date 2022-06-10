import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { LaagTooltip } from 'components/ui';

type UserFreeFeeLimitsType = {
  currentTransactionCount: number;
  maxTransactionCount: number;
  hasFreeTransactions: boolean;
};

const TooltipContent = styled.div`
  width: 300px;
`;

interface Props {
  userFreeFeeLimits: UserFreeFeeLimitsType;
}

export const FeeTransactionTooltip: FC<Props> = ({ userFreeFeeLimits }) => {
  const currentTransactionCount = userFreeFeeLimits.currentTransactionCount;
  const maxTransactionCount = userFreeFeeLimits.maxTransactionCount;
  const availableTransactionsCount = userFreeFeeLimits.hasFreeTransactions
    ? maxTransactionCount - currentTransactionCount
    : 0;

  const elTooltip = (
    <TooltipContent>
      <span>
        On the Solana network, the first {maxTransactionCount} transactions in a day are paid by
        P2P.org. You have {availableTransactionsCount} free transactions left for today
      </span>
      <br />
      <br /> Subsequent transactions will be charged based on the Solana blockchain gas fee.
    </TooltipContent>
  );

  return (
    <LaagTooltip
      withClose={true}
      elContent={elTooltip}
      iconColor={theme.colors.system.successMain}
    />
  );
};
