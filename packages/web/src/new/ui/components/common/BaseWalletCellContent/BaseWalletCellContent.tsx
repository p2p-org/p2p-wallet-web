import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useIsMobile } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import type { Wallet } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { numberToString } from 'new/utils/NumberExtensions';
import { truncatingMiddle } from 'new/utils/StringExtensions';
import { getAvatarSize } from 'utils/common';

import { Content, TokenAvatarStyled, TokenBalance, TokenInfo, TokenName, TokenUSD } from './styled';

interface Props {
  wallet?: Wallet;
  isPlaceholder?: boolean;
  isMobilePopupChild?: boolean;
}

export const BaseWalletCellContent: FC<Props> = observer(
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
        tokenName = truncatingMiddle(wallet.mintAddress, { numOfSymbolsRevealed: 4 });
      }

      return <TokenName title={wallet.mintAddress}>{tokenName}</TokenName>;
    };

    const renderTokenBalance = () => {
      if (!wallet.pubkey) {
        return null;
      }

      return (
        <TokenBalance>
          {numberToString(wallet.amount, { maximumFractionDigits: 9 })} {wallet.token.symbol}
        </TokenBalance>
      );
    };

    const renderTokenUSD = () => {
      if (!wallet.pubkey) {
        return null;
      }

      if (wallet.amountInCurrentFiat) {
        return (
          <TokenUSD>
            {Defaults.fiat.symbol}{' '}
            {numberToString(wallet.amountInCurrentFiat, { maximumFractionDigits: 2 })}
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
            {renderTokenBalance()}
            {renderTokenUSD()}
          </TokenInfo>
        </Content>
      </>
    );
  },
);
