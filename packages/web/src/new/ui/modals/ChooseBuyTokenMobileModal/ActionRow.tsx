import type { FC } from 'react';

import { styled } from '@linaria/react';

import type { Token, Wallet } from 'new/sdk/SolanaSDK';
import {
  BaseTokenCellContent,
  BaseWalletCellContent,
} from 'new/ui/components/common/BaseWalletCellContent';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 26px 10px;
`;

interface Props {
  wallet?: Wallet;
  token?: Token;
  onClick: () => void;
}

export const ActionRow: FC<Props> = ({ wallet, token, onClick }) => {
  return (
    <Wrapper onClick={onClick}>
      {token ? (
        <BaseTokenCellContent token={token} isMobilePopupChild />
      ) : (
        <BaseWalletCellContent wallet={wallet} isMobilePopupChild />
      )}
    </Wrapper>
  );
};
