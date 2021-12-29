import type { FC } from 'react';

import type { u64 } from '@solana/spl-token';

import { useConfig } from 'app/contexts/solana/swap';
import { formatBigNumber } from 'app/contexts/solana/swap/utils/format';
import { TokenAvatar } from 'components/common/TokenAvatar';
import {
  SwapAmount,
  SwapBlock,
  SwapColumn,
  SwapIcon,
  SwapInfo,
  SwapWrapper,
} from 'components/modals/TransactionInfoModals/common/styled';

export type SwapParams = {
  inputTokenName: string;
  inputAmount: u64;
  outputTokenName: string;
  minimumOutputAmount: u64;
};

interface Props {
  params: SwapParams;
}

export const Swap: FC<Props> = ({
  params: { inputTokenName, outputTokenName, inputAmount, minimumOutputAmount },
}) => {
  const { tokenConfigs } = useConfig();

  return (
    <SwapWrapper>
      <SwapColumn>
        <SwapInfo>
          <TokenAvatar symbol={inputTokenName} size={44} />
          <SwapAmount>
            - {formatBigNumber(inputAmount, tokenConfigs[inputTokenName].decimals)} {inputTokenName}
          </SwapAmount>
        </SwapInfo>
      </SwapColumn>
      <SwapBlock>
        <SwapIcon name="swap" />
      </SwapBlock>
      <SwapColumn>
        <SwapInfo>
          <TokenAvatar symbol={outputTokenName} size={44} />
          <SwapAmount>
            + {formatBigNumber(minimumOutputAmount, tokenConfigs[outputTokenName].decimals)}{' '}
            {outputTokenName}
          </SwapAmount>
        </SwapInfo>
      </SwapColumn>
    </SwapWrapper>
  );
};
