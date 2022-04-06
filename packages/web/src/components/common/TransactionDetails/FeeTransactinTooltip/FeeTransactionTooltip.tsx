import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import type { INITIAL_USER_FREE_FEE_LIMITS } from 'app/contexts/api/feeRelayer/utils';
import { LaagTooltip } from 'components/ui';

const TooltipContent = styled.div`
  width: 300px;
`;

interface Props {
  userFreeFeeLimits: typeof INITIAL_USER_FREE_FEE_LIMITS;
}

const FeeToolTip: FC<Props> = (props) => {
  const currentTransactionCount = props.userFreeFeeLimits.currentTransactionCount;
  const maxTransactionCount = props.userFreeFeeLimits.maxTransactionCount;
  const availableTransactionsCount = props.userFreeFeeLimits.hasFreeTransactions
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

export { FeeToolTip };
