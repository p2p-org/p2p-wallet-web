import React, { FC } from 'react';

import { TokenAccount } from 'api/token/TokenAccount';
import { AddressText } from 'components/common/AddressText';
import { TokenAvatar } from 'components/common/TokenAvatar';

import {
  FieldInfo,
  IconWrapper,
  InfoTitle,
  InfoValue,
  InfoWrapper,
  Section,
  Username,
  WalletIcon,
} from '../common/styled';

export type TransferParams = {
  source: TokenAccount;
  destination: string;
  username?: string;
  amount: number;
};

interface Props {
  params: TransferParams;
}

export const Send: FC<Props> = ({ params }) => {
  return (
    <Section className="send">
      <FieldInfo>
        <TokenAvatar
          symbol={(params as TransferParams).source.mint.symbol}
          address={(params as TransferParams).source.mint.address.toBase58()}
          size={44}
        />
        <InfoWrapper>
          <InfoTitle>Check the amount</InfoTitle>
          <InfoValue>
            {(params as TransferParams).amount} {(params as TransferParams).source.mint.symbol}
          </InfoValue>
        </InfoWrapper>
      </FieldInfo>
      <FieldInfo>
        <IconWrapper>
          <WalletIcon name="wallet" />
        </IconWrapper>
        <InfoWrapper>
          {(params as TransferParams).username ? (
            <Username>{(params as TransferParams).username}</Username>
          ) : (
            <InfoTitle>Check recepient’s address</InfoTitle>
          )}
          <InfoValue>
            <AddressText address={(params as TransferParams).destination} medium />
          </InfoValue>
        </InfoWrapper>
      </FieldInfo>
    </Section>
  );
};
