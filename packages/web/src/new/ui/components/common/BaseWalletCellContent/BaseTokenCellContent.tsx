import type { FC } from 'react';

import { useIsMobile } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import type { Token } from 'new/sdk/SolanaSDK';
import { numberToString } from 'new/utils/NumberExtensions';
import { getAvatarSize } from 'utils/common';

import { Content, TokenAvatarStyled, TokenBalance, TokenInfo, TokenName } from './styled';

interface Props {
  token: Token;
  isMobilePopupChild?: boolean;
}

export const BaseTokenCellContent: FC<Props> = observer(({ token, isMobilePopupChild }) => {
  const isMobile = useIsMobile();

  const avatarSize = getAvatarSize(isMobile);

  const renderTokenName = () => {
    return <TokenName title={token.symbol}>{token.name}</TokenName>;
  };

  const elTokenBalance = (
    <TokenBalance>
      {numberToString(0, { maximumFractionDigits: 9 })} {token.symbol}
    </TokenBalance>
  );

  return (
    <>
      <TokenAvatarStyled token={token} size={avatarSize} />
      <Content className={classNames({ isMobilePopupChild })}>
        <TokenInfo>
          {renderTokenName()}
          {elTokenBalance}
        </TokenInfo>
      </Content>
    </>
  );
});
