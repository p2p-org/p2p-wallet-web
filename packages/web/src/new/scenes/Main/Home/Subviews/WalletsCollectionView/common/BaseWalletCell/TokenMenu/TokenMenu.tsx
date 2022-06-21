import type { FC, HTMLAttributes } from 'react';
import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { useConfig } from 'app/contexts';
import { Menu, MenuItem } from 'components/ui';
import type { Wallet } from 'new/sdk/SolanaSDK';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

// export for styling on hover in TokenAccountRow
export const MenuStyled = styled(Menu)``;

interface Props extends HTMLAttributes<HTMLDivElement> {
  wallet: Wallet;
  isHidden: boolean;
  onToggleClick: () => void;
}

export const TokenMenu: FC<Props> = observer(
  ({ wallet, isHidden = false, onToggleClick, className }) => {
    const history = useHistory();
    const location = useLocation();
    const { tokenConfigs } = useConfig();

    const handleButtonClick = useCallback(
      (route: string) => () => {
        history.push(route, { fromPage: location.pathname });
      },
      [history, location.pathname],
    );

    return (
      <Wrapper className={className}>
        <MenuStyled vertical>
          {wallet.token.isNativeSOL || wallet.token.symbol === 'USDC' ? (
            <MenuItem icon="plus" onItemClick={handleButtonClick(`/buy/${wallet.token.symbol}`)}>
              Buy {wallet.token.symbol}
            </MenuItem>
          ) : undefined}
          <MenuItem icon="top" onItemClick={handleButtonClick(`/send/${wallet.pubkey}`)}>
            Send {wallet.token.symbol}
          </MenuItem>
          {wallet.token.symbol && tokenConfigs[wallet.token.symbol] ? (
            <MenuItem icon="swap" onItemClick={handleButtonClick(`/swap/${wallet.token.symbol}`)}>
              Swap {wallet.token.symbol}
            </MenuItem>
          ) : undefined}
          <MenuItem icon="bottom" onItemClick={handleButtonClick('/receive')}>
            Receive {wallet.token.symbol}
          </MenuItem>
          {!wallet.token.isNativeSOL ? (
            <MenuItem icon={isHidden ? 'eye' : 'eye-hide'} onItemClick={onToggleClick}>
              {isHidden ? 'Show' : 'Hide'} {wallet.token.symbol}
            </MenuItem>
          ) : undefined}
        </MenuStyled>
      </Wrapper>
    );
  },
);
