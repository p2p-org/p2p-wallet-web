import type { FC } from 'react';

import { styled } from '@linaria/react';

import type { Wallet } from 'new/sdk/SolanaSDK';
import { TokenAccountRowContent } from 'new/ui/components/common/TokenAccountRowContent';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 26px 10px;
`;

interface Props {
  wallet?: Wallet;
  onClick: () => void;
}

export const ActionRow: FC<Props> = ({ wallet, onClick }) => {
  return (
    <Wrapper onClick={onClick}>
      <TokenAccountRowContent wallet={wallet} isMobilePopupChild />
    </Wrapper>
  );
};
