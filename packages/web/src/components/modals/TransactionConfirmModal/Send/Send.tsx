import type { FC } from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';
import type { TokenAmount } from '@saberhq/token-utils';
import type { PublicKey } from '@solana/web3.js';
import { Feature } from 'flagged';

import { AddressText } from 'components/common/AddressText';
import { AmountUSD } from 'components/common/AmountUSD';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { TransactionDetails } from 'components/common/TransactionDetails';
import { Icon } from 'components/ui';
import { FEATURE_TRANSACTION_DETAILS_ACCORDION } from 'config/featureFlags';

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

const ArrowWrapper = styled.div`
  position: relative;

  height: 16px;
  margin-left: 26px;
`;

const ArrowIconWrapper = styled.div`
  position: relative;
  top: -8px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  color: ${theme.colors.textIcon.active};

  background: ${theme.colors.bg.primary};
  border: 1px solid ${theme.colors.stroke.secondary};
  border-radius: 12px;

  &::before,
  &::after {
    position: absolute;

    width: 1px;
    height: 16px;

    background: ${theme.colors.bg.primary};

    content: '';
  }

  &::before {
    left: -1px;
  }

  &::after {
    right: -1px;
  }
`;

const ArrowIcon = styled(Icon)`
  width: 16px;
  height: 16px;
`;

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
      <div>
        <FieldInfo>
          <TokenAvatar
            symbol={params.source.balance?.token.symbol}
            address={params.source.balance?.token.address}
            size={44}
          />
          <InfoWrapper>
            <InfoTitle>{params.amount.formatUnits()}</InfoTitle>
            <InfoValue>
              <AmountUSD value={params.amount} />
            </InfoValue>
          </InfoWrapper>
        </FieldInfo>
        <ArrowWrapper>
          <ArrowIconWrapper>
            <ArrowIcon name="arrow-down" />
          </ArrowIconWrapper>
        </ArrowWrapper>
        <FieldInfo>
          <IconWrapper>
            <WalletIcon name="wallet" />
          </IconWrapper>
          <InfoWrapper>
            {params.username ? (
              <Username>{params.username}</Username>
            ) : (
              <InfoTitle className="secondary">To address</InfoTitle>
            )}
            <InfoValue>
              <AddressText address={params.destination.toBase58()} medium />
            </InfoValue>
          </InfoWrapper>
        </FieldInfo>
      </div>

      <Feature name={FEATURE_TRANSACTION_DETAILS_ACCORDION}>
        <TransactionDetails />
      </Feature>
    </Section>
  );
};
