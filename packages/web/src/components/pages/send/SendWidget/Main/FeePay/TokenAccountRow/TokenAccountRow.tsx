import type { FunctionComponent } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';

import { AmountUSD } from 'components/common/AmountUSD';
import { TokenAvatar } from 'components/common/TokenAvatar';

const Wrapper = styled.div`
  padding: 12px;

  border: 0.5px solid transparent;
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.bg.activePrimary};
    border-color: ${theme.colors.textIcon.links};
  }
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 44px;
`;

const Info = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.02em;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

type Props = {
  tokenAccount: TokenAccount;
  onClick?: (tokenAccount: TokenAccount) => void;
  className?: string;
};

export const TokenAccountRow: FunctionComponent<Props> = ({ tokenAccount, onClick, className }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(tokenAccount);
    }
  };

  const { loading } = tokenAccount;

  return (
    <Wrapper onClick={handleClick} className={className}>
      <ItemWrapper>
        {loading ? (
          <Skeleton width={44} height={44} borderRadius={12} />
        ) : (
          <TokenAvatar size={44} token={tokenAccount.balance?.token} />
        )}
        <Info>
          <Top>
            {loading ? (
              <Skeleton width={100} height={16} />
            ) : (
              <>{tokenAccount.balance?.formatUnits()}</>
            )}
          </Top>
          <Bottom>
            {loading ? (
              <Skeleton width={50} height={16} />
            ) : tokenAccount.balance ? (
              <AmountUSD value={tokenAccount.balance} />
            ) : (
              <div />
            )}
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
