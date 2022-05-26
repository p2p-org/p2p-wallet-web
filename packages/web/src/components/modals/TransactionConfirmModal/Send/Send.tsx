import type { FC } from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import type { TokenAmount } from '@p2p-wallet-web/token-utils';
import { theme } from '@p2p-wallet-web/ui';
import type { PublicKey } from '@solana/web3.js';

import { AddressText } from 'components/common/AddressText';
import { AmountUSD } from 'components/common/AmountUSD';
import { TokenAvatar } from 'components/common/TokenAvatar';
import type { TransactionDetailsProps } from 'components/common/TransactionDetails';
import { TransactionDetails } from 'components/common/TransactionDetails';
import { Icon } from 'components/ui';

import {
  FieldInfo,
  IconWrapper,
  InfoTitle,
  InfoValue,
  InfoWrapper,
  Section,
  To,
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

export const Send: FC<Props & TransactionDetailsProps> = ({ params, sendState, btcAddress }) => {
  const address = params.destination?.toBase58?.() || btcAddress;
  const isFullName = /\w*\.\w+/.test(params.username || '');

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
              <Username>
                <To>To</To>
                {isFullName ? params.username : `${params.username}.p2p.sol`}
              </Username>
            ) : (
              <InfoTitle className="secondary">To address</InfoTitle>
            )}
            <InfoValue>{address && <AddressText address={address} medium />}</InfoValue>
          </InfoWrapper>
        </FieldInfo>
      </div>

      <TransactionDetails sendState={sendState} amount={params.amount.toU64()} />
    </Section>
  );
};
