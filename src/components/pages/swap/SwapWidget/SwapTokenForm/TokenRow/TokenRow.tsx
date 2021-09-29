import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';
import { Decimal } from 'decimal.js';

import { useOwnedTokenAccount } from 'app/contexts/swap/token';
import { useTokenMap } from 'app/contexts/swap/tokenList';
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
  mint: string;
  onClick: (token: PublicKey) => void;
};

export const TokenRow: FunctionComponent<Props> = ({ mint, onClick }) => {
  const tokenMap = useTokenMap();
  const tokenInfo = tokenMap.get(mint.toString());
  const tokenAccount = useOwnedTokenAccount(new PublicKey(mint));

  const balance =
    tokenAccount && tokenInfo && tokenAccount.account.amount.toNumber() / 10 ** tokenInfo.decimals;

  const handleClick = () => {
    onClick(new PublicKey(mint));
  };

  return (
    <Wrapper onClick={handleClick}>
      <ItemWrapper>
        <TokenAvatar address={tokenInfo?.address} size={44} />
        <Info>
          <Top>
            <TokenSymbol title={tokenInfo?.address}>
              {tokenInfo?.symbol || shortAddress(mint)}
            </TokenSymbol>
            {tokenAccount ? (
              <AmountUSD symbol={tokenInfo?.symbol} value={new Decimal(balance || 0)} />
            ) : undefined}
          </Top>
          <Bottom>
            <div>{tokenInfo?.name}</div>
            {tokenAccount ? (
              <div>
                {balance} {tokenInfo?.symbol}
              </div>
            ) : undefined}
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
