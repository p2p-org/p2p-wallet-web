import type { FC, HTMLAttributes } from 'react';
import { useCallback } from 'react';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

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
    const navigate = useNavigate();
    const location = useLocation();

    const handleButtonClick = useCallback(
      (route: string) => () => {
        navigate(route, { state: { fromPage: location.pathname } });
      },
      [navigate, location.pathname],
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
          {wallet.token.symbol ? (
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
