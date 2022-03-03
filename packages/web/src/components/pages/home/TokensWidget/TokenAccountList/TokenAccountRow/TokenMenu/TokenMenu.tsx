import type { FC, HTMLAttributes } from 'react';
import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { USDC_MINT } from '@p2p-wallet-web/core';

import { useConfig, useSettings } from 'app/contexts';
import { Menu, MenuItem } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

// export for styling on hover in TokenAcountRow
export const MenuStyled = styled(Menu)``;

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokenAccount: TokenAccount;
  isHidden?: boolean;
}

export const TokenMenu: FC<Props> = ({ tokenAccount, isHidden = false, className }) => {
  const history = useHistory();
  const location = useLocation();
  const { tokenConfigs } = useConfig();
  const { toggleHideTokenAccount } = useSettings();

  const handleButtonClick = useCallback(
    (route: string) => () => {
      history.push(route, { fromPage: location.pathname });
    },
    [history, location.pathname],
  );

  const handleToggleHideClick = useCallback(() => {
    const tokenAddress = tokenAccount.key?.toBase58();
    if (tokenAddress) {
      const isZero = !tokenAccount.balance || tokenAccount.balance.equalTo(0);
      toggleHideTokenAccount(tokenAddress, isZero);
    }
  }, [toggleHideTokenAccount, tokenAccount.balance, tokenAccount.key]);

  return (
    <Wrapper className={className}>
      <MenuStyled vertical>
        {tokenAccount.balance?.token.isRawSOL ||
        tokenAccount.balance?.token.mintAccount.equals(USDC_MINT) ? (
          <MenuItem
            icon="plus"
            onItemClick={handleButtonClick(`/buy/${tokenAccount.balance.token.symbol}`)}
          >
            Buy {tokenAccount.balance.token.symbol}
          </MenuItem>
        ) : undefined}
        <MenuItem
          icon="top"
          onItemClick={handleButtonClick(`/send/${tokenAccount.key?.toBase58()}`)}
        >
          Send {tokenAccount.balance?.token.symbol}
        </MenuItem>
        {tokenAccount?.balance?.token.symbol && tokenConfigs[tokenAccount?.balance.token.symbol] ? (
          <MenuItem
            icon="swap"
            onItemClick={handleButtonClick(`/swap/${tokenAccount.balance.token.symbol}`)}
          >
            Swap {tokenAccount.balance.token.symbol}
          </MenuItem>
        ) : undefined}
        <MenuItem icon="bottom" onItemClick={handleButtonClick('/receive')}>
          Receive {tokenAccount.balance?.token.symbol}
        </MenuItem>
        {!tokenAccount.balance?.token.isRawSOL ? (
          <MenuItem icon={isHidden ? 'eye' : 'eye-hide'} onItemClick={handleToggleHideClick}>
            {isHidden ? 'Show' : 'Hide'} {tokenAccount.balance?.token.symbol}
          </MenuItem>
        ) : undefined}
      </MenuStyled>
    </Wrapper>
  );
};
