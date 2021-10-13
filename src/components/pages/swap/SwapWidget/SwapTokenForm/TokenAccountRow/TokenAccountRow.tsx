import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { useConfig } from 'app/contexts/swap';
import TokenAccount from 'app/contexts/swap/models/TokenAccount';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { shortAddress } from 'utils/tokens';

import { AmountUSD } from '../../AmountUSD';

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
  onClick?: (tokenAccount: TokenAccount) => void;
  className?: string;
};

export const TokenAccountRow: FC<Props> = ({ tokenAccount, onClick, className }) => {
  const { mintToTokenName } = useConfig();

  const mintAddress = tokenAccount.accountInfo.mint.toBase58();
  const tokenName = mintToTokenName[mintAddress];

  const handleClick = () => {
    if (onClick) {
      onClick(tokenAccount);
    }
  };

  return (
    <Wrapper onClick={handleClick} className={className}>
      <ItemWrapper>
        <TokenAvatar symbol={tokenName} address={mintAddress} size={44} />
        <Info>
          <Top>
            <TokenSymbol title={mintAddress}>{tokenName || shortAddress(mintAddress)}</TokenSymbol>
            <AmountUSD tokenName={tokenName} amount={tokenAccount.getAmount()} />
          </Top>
          <Bottom>
            <div>{shortAddress(mintAddress)}</div>
            <div>
              {tokenAccount.getAmount().toString()} {tokenName}
            </div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
