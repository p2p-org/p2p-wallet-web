import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { theme, up, useIsMobile } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { shortAddress } from 'utils/tokens';

import { AmountUSD } from '../AmountUSD';
import { TokenAvatar } from '../TokenAvatar';

export const TokenAvatarStyled = styled(TokenAvatar)``;

const TokenInfo = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: 22px 22px;
  grid-template-columns: 1fr 1fr;
`;

const TokenName = styled.div`
  flex: 1;

  max-width: 300px;
  overflow: hidden;

  color: ${theme.colors.textIcon.primary};

  font-weight: 700;
  font-size: 14px;
  line-height: 140%;

  ${up.tablet} {
    font-weight: 600;
    font-size: 16px;
  }

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const TokenBalance = styled.div`
  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 13px;
  line-height: 140%;

  ${up.tablet} {
    font-size: 14px;
  }
`;

const TokenUSD = styled.div`
  grid-row: 1 / -1;
  align-self: center;
  justify-self: flex-end;

  color: #202020;
  font-weight: 600;
  font-size: 17px;
  line-height: 140%;

  ${up.tablet} {
    font-size: 18px;
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 12px;

  &.isMobilePopupChild {
    ${TokenInfo} {
      grid-template-rows: 20px 20px;
    }

    ${TokenName} {
      font-weight: 500;
    }

    ${TokenBalance} {
      font-size: 14px;
    }

    ${TokenUSD} {
      font-size: 16px;
    }
  }
`;

interface Props {
  tokenAccount?: TokenAccount;
  isMobilePopupChild?: boolean;
}

export const TokenAccountRowContent: FC<Props> = ({ tokenAccount, isMobilePopupChild }) => {
  const isMobile = useIsMobile();

  if (!tokenAccount) {
    return null;
  }

  const avatarSize = isMobile ? 32 : 44;
  const { loading } = tokenAccount;

  const renderTokenName = () => {
    const tokenName =
      tokenAccount.balance?.token.name ||
      tokenAccount.balance?.token.symbol ||
      (tokenAccount.balance?.token.address && shortAddress(tokenAccount.balance?.token.address));

    return (
      <TokenName title={tokenAccount.balance?.token.address}>
        {loading ? <Skeleton width={100} height={16} /> : tokenName}
      </TokenName>
    );
  };

  const elTokenBalance = (
    <TokenBalance>
      {loading ? <Skeleton width={100} height={14} /> : <>{tokenAccount.balance?.formatUnits()}</>}
    </TokenBalance>
  );

  const renderTokenUSD = () => {
    if (loading) {
      return (
        <TokenUSD>
          <Skeleton width={50} height={14} />
        </TokenUSD>
      );
    }

    if (tokenAccount.balance) {
      return (
        <TokenUSD>
          <AmountUSD value={tokenAccount.balance} />
        </TokenUSD>
      );
    }

    return null;
  };

  return (
    <>
      {loading ? (
        <Skeleton height={avatarSize} width={avatarSize} borderRadius={12} />
      ) : (
        <TokenAvatarStyled
          symbol={tokenAccount?.balance?.token.symbol}
          address={tokenAccount?.balance?.token.address}
          size={avatarSize}
        />
      )}
      <Content className={classNames({ isMobilePopupChild })}>
        <TokenInfo>
          {renderTokenName()}
          {elTokenBalance}
          {renderTokenUSD()}
        </TokenInfo>
      </Content>
    </>
  );
};
