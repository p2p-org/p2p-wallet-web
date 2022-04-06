import type { FC } from 'react';

import type { u64 } from '@solana/spl-token';

import { useConfig } from 'app/contexts/solana/swap';
import { formatBigNumber } from 'app/contexts/solana/swap/utils/format';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { AmountUSD } from 'components/pages/swap/SwapWidget/AmountUSD';
import type { FeesOriginalProps } from 'components/pages/swap/SwapWidget/Fees/FeesOriginal';
import { FeesOriginal } from 'components/pages/swap/SwapWidget/Fees/FeesOriginal';
import { Icon } from 'components/ui';

import {
  FieldInfo,
  FromToWrapper,
  InfoTitle,
  InfoValue,
  InfoWrapper,
  Overlay,
  Section,
  Subtitle,
  Wrapper,
} from '../common/styled';

export type SwapParams = {
  inputTokenName: string;
  outputTokenName: string;
  inputAmount: u64;
  minimumOutputAmount: u64;
};

interface Props {
  params: SwapParams;
}

export const Swap: FC<Props & FeesOriginalProps> = ({
  params: { inputTokenName, outputTokenName, inputAmount },
  ...props
}) => {
  const { tokenConfigs } = useConfig();
  const inputDecimals = tokenConfigs[inputTokenName]?.decimals || 0;
  const outputDecimals = tokenConfigs[outputTokenName]?.decimals || 0;
  const minReceiveAmount = formatBigNumber(
    props.swapInfo.trade.getMinimumOutputAmount(),
    outputDecimals,
  );

  return (
    <Wrapper>
      <Subtitle>You are going to swap</Subtitle>
      <Section className="swap">
        <FieldInfo>
          <TokenAvatar symbol={inputTokenName} size={44} />
          <InfoWrapper>
            <InfoTitle>
              {formatBigNumber(inputAmount, inputDecimals)} {inputTokenName}
            </InfoTitle>
            <InfoValue>
              <AmountUSD
                prefix={'~'}
                amount={props.swapInfo.trade.getInputAmount()}
                tokenName={props.swapInfo.trade.inputTokenName}
              />
            </InfoValue>
          </InfoWrapper>
        </FieldInfo>
      </Section>
      <FromToWrapper>
        <Overlay>
          <Icon name={'arrow-down'} />
        </Overlay>
      </FromToWrapper>
      <Section className="top">
        <FieldInfo>
          <TokenAvatar symbol={outputTokenName} size={44} />
          <InfoWrapper>
            <InfoTitle>
              {formatBigNumber(props.swapInfo.trade.getOutputAmount(), outputDecimals)}{' '}
              {outputTokenName}
            </InfoTitle>
            <InfoValue>
              Receive at least: {minReceiveAmount} {props.swapInfo.trade.outputTokenName}
            </InfoValue>
          </InfoWrapper>
        </FieldInfo>
      </Section>
      <FeesOriginal
        swapInfo={props.swapInfo}
        userTokenAccounts={props.userTokenAccounts}
        feeCompensationInfo={props.feeCompensationInfo}
        feeLimitsInfo={props.feeLimitsInfo}
        priceInfo={props.priceInfo}
        solanaProvider={props.solanaProvider}
        networkFees={props.networkFees}
        open={false}
        forPage={false}
      />
    </Wrapper>
  );
};
