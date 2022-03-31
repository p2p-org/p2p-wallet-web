import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { theme, up, useIsMobile } from '@p2p-wallet-web/ui';

import { shortAddress } from 'utils/tokens';

import { AmountUSD } from '../AmountUSD';
import { TokenAvatar } from '../TokenAvatar';

interface MobileChildProps {
  isMobilePopupChild?: boolean;
}

export const TokenAvatarStyled = styled(TokenAvatar)``;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 12px;
`;

const TokenInfo = styled.div<MobileChildProps>`
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: ${(props) => (props.isMobilePopupChild ? '20px 20px' : '22px 22px')};
  grid-template-columns: 1fr 1fr;
`;

const TokenName = styled.div<MobileChildProps>`
  flex: 1;

  max-width: 300px;
  overflow: hidden;

  color: ${theme.colors.textIcon.primary};

  font-weight: ${(props) => (props.isMobilePopupChild ? 500 : 700)};
  font-size: 14px;
  line-height: 140%;

  ${up.tablet} {
    font-weight: 600;
    font-size: 16px;
  }

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const TokenBalance = styled.div<MobileChildProps>`
  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: ${(props) => (props.isMobilePopupChild ? '14px' : '13px')};
  line-height: 140%;

  ${up.tablet} {
    font-size: 14px;
  }
`;

const TokenUSD = styled.div<MobileChildProps>`
  grid-row: 1 / -1;
  align-self: center;
  justify-self: flex-end;

  color: #202020;
  font-weight: 600;
  font-size: ${(props) => (props.isMobilePopupChild ? '16px' : '17px')};
  line-height: 140%;

  ${up.tablet} {
    font-size: 18px;
  }
`;

interface Props extends MobileChildProps {
  tokenAccount?: TokenAccount;
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
      <TokenName
        title={tokenAccount.balance?.token.address}
        isMobilePopupChild={isMobilePopupChild}
      >
        {loading ? <Skeleton width={100} height={16} /> : tokenName}
      </TokenName>
    );
  };

  const elTokenBalance = (
    <TokenBalance isMobilePopupChild={isMobilePopupChild}>
      {loading ? <Skeleton width={100} height={14} /> : <>{tokenAccount.balance?.formatUnits()}</>}
    </TokenBalance>
  );

  const renderTokenUSD = () => {
    if (loading) {
      return (
        <TokenUSD isMobilePopupChild={isMobilePopupChild}>
          <Skeleton width={50} height={14} />
        </TokenUSD>
      );
    }

    if (tokenAccount.balance) {
      return (
        <TokenUSD isMobilePopupChild={isMobilePopupChild}>
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
      <Content>
        <TokenInfo isMobilePopupChild={isMobilePopupChild}>
          {renderTokenName()}
          {elTokenBalance}
          {renderTokenUSD()}
        </TokenInfo>
      </Content>
    </>
  );
};
