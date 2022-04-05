import type { FC } from 'react';

import type { u64 } from '@solana/spl-token';

import { useConfig } from 'app/contexts/solana/swap';
import type Trade from 'app/contexts/solana/swap/models/Trade';
import { formatBigNumber } from 'app/contexts/solana/swap/utils/format';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { AmountUSD } from 'components/pages/swap/SwapWidget/AmountUSD';
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
  trade: Trade;
}

export const Swap: FC<Props> = ({
  params: { inputTokenName, outputTokenName, inputAmount },
  ...props
}) => {
  const { tokenConfigs } = useConfig();
  const decimals = tokenConfigs[inputTokenName]?.decimals || 0;
  const minReceiveAmount = formatBigNumber(props.trade.getMinimumOutputAmount(), decimals);

  return (
    <Wrapper>
      <Subtitle>You are going to swap</Subtitle>
      <Section className="swap">
        <FieldInfo>
          <TokenAvatar symbol={inputTokenName} size={44} />
          <InfoWrapper>
            <InfoTitle>
              {formatBigNumber(inputAmount, decimals)} {inputTokenName}
            </InfoTitle>
            <InfoValue>
              <AmountUSD
                prefix={'~'}
                amount={props.trade.getInputAmount()}
                tokenName={props.trade.inputTokenName}
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
              {formatBigNumber(props.trade.getOutputAmount(), decimals)} {outputTokenName}
            </InfoTitle>
            <InfoValue>
              Receive at least: {minReceiveAmount} {props.trade.outputTokenName}
            </InfoValue>
          </InfoWrapper>
        </FieldInfo>
      </Section>
    </Wrapper>
  );
};
