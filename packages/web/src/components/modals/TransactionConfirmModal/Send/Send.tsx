import type { FC } from 'react';

import type { TokenAccount } from '@p2p-wallet-web/core';
import type { TokenAmount } from '@saberhq/token-utils';
import type { PublicKey } from '@solana/web3.js';

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
  destination: PublicKey;
  amount: TokenAmount;
  username?: string;
};

interface Props {
  params: TransferParams;
}

export const Send: FC<Props> = ({ params }) => {
  return (
    <Section className="send">
      <FieldInfo>
        <TokenAvatar
          symbol={params.source.balance?.token.symbol}
          address={params.source.balance?.token.address}
          size={44}
        />
        <InfoWrapper>
          <InfoTitle>Check the amount</InfoTitle>
          <InfoValue>{params.amount.formatUnits()}</InfoValue>
        </InfoWrapper>
      </FieldInfo>
      <FieldInfo>
        <IconWrapper>
          <WalletIcon name="wallet" />
        </IconWrapper>
        <InfoWrapper>
          {params.username ? (
            <Username>{params.username}</Username>
          ) : (
            <InfoTitle>Check recepient’s address</InfoTitle>
          )}
          <InfoValue>
            <AddressText address={params.destination.toBase58()} medium />
          </InfoValue>
        </InfoWrapper>
      </FieldInfo>
    </Section>
  );
};
