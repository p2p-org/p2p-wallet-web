import type { FC } from 'react';

import type { u64 } from '@solana/spl-token';

import { useConfig } from 'app/contexts/solana/swap';
import { formatBigNumber } from 'app/contexts/solana/swap/utils/format';
import { TokenAvatar } from 'components/common/TokenAvatar';

import {
  FieldInfo,
  InfoTitle,
  InfoValue,
  InfoWrapper,
  Section,
  SectionTitle,
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
    <>
      <Section className="swap">
        <SectionTitle>From</SectionTitle>
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
      <Section className="top">
        <SectionTitle>To</SectionTitle>
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
        {/*<FieldInfo>*/}
        {/*  <IconWrapper>*/}
        {/*    <WalletIcon name="wallet" />*/}
        {/*  </IconWrapper>*/}
        {/*  <InfoWrapper>*/}
        {/*    <InfoTitle>Destination wallet</InfoTitle>*/}
        {/*    <InfoValue>*/}
        {/*      {(params as SwapParams).secondTokenAccount*/}
        {/*        ? (params as SwapParams).secondTokenAccount.address.toBase58()*/}
        {/*        : 'Will be created after transaction processing'}*/}
        {/*    </InfoValue>*/}
        {/*  </InfoWrapper>*/}
        {/*</FieldInfo>*/}
      </Section>
    </>
  );
};
