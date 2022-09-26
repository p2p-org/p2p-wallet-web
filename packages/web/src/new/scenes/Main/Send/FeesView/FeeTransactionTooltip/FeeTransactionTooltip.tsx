import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { LaagTooltip } from 'components/ui';
import type * as FeeRelayer from 'new/sdk/FeeRelayer';
import { LoaderBlock } from 'new/ui/components/common/LoaderBlock';

const TooltipContent = styled.div`
  width: 300px;

  &.loader {
    padding: 50px 0;
  }
`;

interface Props {
  viewModel: Readonly<{
    getFreeTransactionFeeLimit(): Promise<FeeRelayer.UsageStatus>;
  }>;
}

export const FeeTransactionTooltip: FC<Props> = ({ viewModel }) => {
  const [limit, setLimit] = useState<FeeRelayer.UsageStatus | null>(null);

  const handleChange = useCallback(
    (isOver: boolean) => {
      if (isOver) {
        setLimit(null);
        void viewModel.getFreeTransactionFeeLimit().then((limit) => setLimit(limit));
      }
    },
    [viewModel],
  );

  const elContent = (
    <TooltipContent>
      {!limit ? (
        <TooltipContent className="loader">
          <LoaderBlock />
        </TooltipContent>
      ) : (
        <>
          <span>
            On the Solana network, the first {limit.maxUsage} transactions in a day are paid by
            P2P.org. You have {limit.maxUsage - limit.currentUsage} free transactions left for today
          </span>
          <br />
          <br /> Subsequent transactions will be charged based on the Solana blockchain gas fee.
        </>
      )}
    </TooltipContent>
  );

  const iconColor = useMemo(() => {
    if (!limit) {
      return theme.colors.system.successMain;
    }

    if (limit.currentUsage >= limit.maxUsage) {
      return theme.colors.textIcon.secondary;
    }

    return theme.colors.system.successMain;
  }, [limit]);

  return (
    <LaagTooltip
      withClose={true}
      elContent={elContent}
      iconColor={iconColor}
      onChange={handleChange}
    />
  );
};
