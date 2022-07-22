import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import { theme, up, useIsMobile } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import type { Wallet } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { getAvatarSize } from 'utils/common';
import { shortAddress } from 'utils/tokens';

import { TokenAvatar } from './../TokenAvatar';

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

  // TODO: remove
  // &.isMobilePopupChild {
  //   ${TokenInfo} {
  //     grid-template-rows: 20px 20px;
  //   }
  //
  //   ${TokenName} {
  //     font-weight: 500;
  //   }
  //
  //   ${TokenBalance} {
  //     font-size: 14px;
  //   }
  //
  //   ${TokenUSD} {
  //     font-size: 16px;
  //   }
  // }

  .isSelected & {
    ${TokenName} {
      font-weight: 700;
    }

    ${TokenUSD} {
      font-weight: 700;
    }
  }
`;

interface Props {
  wallet?: Wallet;
  isPlaceholder?: boolean;
}

export const BaseWalletCellContent: FC<Props> = observer(({ wallet, isPlaceholder }) => {
  const isMobile = useIsMobile();

  const avatarSize = getAvatarSize(isMobile);

  if (isPlaceholder || !wallet) {
    return (
      <>
        <Skeleton height={avatarSize} width={avatarSize} borderRadius={12} />
        <Content>
          <TokenInfo>
            <TokenName>
              <Skeleton width={100} height={16} />
            </TokenName>
            <TokenBalance>
              <Skeleton width={100} height={14} />
            </TokenBalance>
            <TokenUSD>
              <Skeleton width={50} height={14} />
            </TokenUSD>
          </TokenInfo>
        </Content>
      </>
    );
  }

  const renderTokenName = () => {
    let tokenName = wallet.token.name;
    if (!tokenName) {
      tokenName = shortAddress(wallet.mintAddress);
    }

    return <TokenName title={wallet.mintAddress}>{tokenName}</TokenName>;
  };

  const elTokenBalance = <TokenBalance>{wallet.amount.formatUnits()}</TokenBalance>;

  const renderTokenUSD = () => {
    if (wallet.amountInCurrentFiat) {
      return (
        <TokenUSD>
          {Defaults.fiat.symbol} {wallet.amountInCurrentFiat.toFixed(2)}
        </TokenUSD>
      );
    }

    return null;
  };

  return (
    <>
      <TokenAvatarStyled token={wallet.token} size={avatarSize} />
      <Content>
        <TokenInfo>
          {renderTokenName()}
          {elTokenBalance}
          {renderTokenUSD()}
        </TokenInfo>
      </Content>
    </>
  );
});
