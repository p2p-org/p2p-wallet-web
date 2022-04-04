import type { FC } from 'react';

import type { u64 } from '@solana/spl-token';

import { useConfig } from 'app/contexts/solana/swap';
import { formatBigNumber } from 'app/contexts/solana/swap/utils/format';
import { TokenAvatar } from 'components/common/TokenAvatar';
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

export const Swap: FC<Props> = ({
  params: { inputTokenName, outputTokenName, inputAmount, minimumOutputAmount },
}) => {
  const { tokenConfigs } = useConfig();

  return (
    <Wrapper>
      <Subtitle>You are going to swap</Subtitle>
      <Section className="swap">
        <FieldInfo>
          <TokenAvatar symbol={inputTokenName} size={44} />
          <InfoWrapper>
            <InfoTitle>Check the amount</InfoTitle>
            <InfoValue>
              {formatBigNumber(inputAmount, tokenConfigs[inputTokenName].decimals)} {inputTokenName}
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
            <InfoTitle>Minimum receive</InfoTitle>
            <InfoValue>
              {formatBigNumber(minimumOutputAmount, tokenConfigs[outputTokenName].decimals)}{' '}
              {outputTokenName}
            </InfoValue>
          </InfoWrapper>
        </FieldInfo>
      </Section>
    </Wrapper>
  );
};
