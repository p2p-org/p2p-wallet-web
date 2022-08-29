import type { FC } from 'react';

import { styled } from '@linaria/react';

import type { Token, Wallet } from 'new/sdk/SolanaSDK';
import { TokenRowContent, WalletRowContent } from 'new/ui/components/common/WalletRowContent';

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
        <TokenRowContent token={token} isMobilePopupChild />
      ) : (
        <WalletRowContent wallet={wallet} isMobilePopupChild />
      )}
    </Wrapper>
  );
};
