import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useIsMobile } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import type { Wallet } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { getAvatarSize } from 'utils/common';
import { shortAddress } from 'utils/tokens';

import { Content, TokenAvatarStyled, TokenBalance, TokenInfo, TokenName, TokenUSD } from './styled';

interface Props {
  wallet?: Wallet;
  isPlaceholder?: boolean;
  isMobilePopupChild?: boolean;
}

export const WalletRowContent: FC<Props> = observer(
  ({ wallet, isPlaceholder, isMobilePopupChild }) => {
    const isMobile = useIsMobile();

    const avatarSize = getAvatarSize(isMobile);

    if (isPlaceholder || !wallet) {
      return (
        <>
          <Skeleton height={avatarSize} width={avatarSize} borderRadius={12} />
          <Content className={classNames({ isMobilePopupChild })}>
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
        <Content className={classNames({ isMobilePopupChild })}>
          <TokenInfo>
            {renderTokenName()}
            {elTokenBalance}
            {renderTokenUSD()}
          </TokenInfo>
        </Content>
      </>
    );
  },
);
