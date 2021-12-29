import type { FunctionComponent } from 'react';
import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';

import { AmountUSD } from 'components/common/AmountUSD';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { shortAddress } from 'utils/tokens';

const Wrapper = styled.div`
  padding: 10px 20px;

  cursor: pointer;
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 44px;
`;

const Info = styled.div`
  flex: 1;
  margin-left: 20px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`;

const TokenSymbol = styled.div`
  max-width: 300px;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

type Props = {
  tokenAccount: TokenAccount;
  showAddress?: boolean;
  onClick?: (tokenAccount: TokenAccount) => void;
  className?: string;
};

export const TokenAccountRow: FunctionComponent<Props> = ({
  tokenAccount,
  showAddress,
  onClick,
  className,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(tokenAccount);
    }
  };

  const tokenNameOrAddress = useMemo(() => {
    const _name = tokenAccount.balance?.token.name;

    if (showAddress || !_name) {
      return tokenAccount.key && shortAddress(tokenAccount.key.toBase58());
    }

    return _name;
  }, [showAddress, tokenAccount.balance?.token.name, tokenAccount.key]);

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
            <TokenSymbol title={tokenAccount.balance?.token.address}>
              {loading ? (
                <Skeleton width={50} height={16} />
              ) : (
                tokenAccount.balance?.token.symbol ||
                (tokenAccount.balance?.token.address &&
                  shortAddress(tokenAccount.balance?.token.address))
              )}
            </TokenSymbol>
            {loading ? (
              <Skeleton width={50} height={16} />
            ) : tokenAccount.balance ? (
              <AmountUSD value={tokenAccount.balance} />
            ) : (
              <div />
            )}
          </Top>
          <Bottom>
            <div>{loading ? <Skeleton width={100} height={14} /> : tokenNameOrAddress}</div>
            <div>
              {loading ? (
                <Skeleton width={100} height={16} />
              ) : (
                <>{tokenAccount.balance?.formatUnits()}</>
              )}
            </div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
