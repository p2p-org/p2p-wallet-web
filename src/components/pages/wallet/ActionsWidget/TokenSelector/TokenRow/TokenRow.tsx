import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { TokenAvatar } from 'components/common/TokenAvatar';
import { RootState, TokenAccount } from 'store/types';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';

const Wrapper = styled.div`
  padding: 15px 12px;

  cursor: pointer;
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 35px;
`;

const Info = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #fff;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
`;

const TokenName = styled.div`
  max-width: 300px;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;

  color: ${rgba('#ffff', 0.5)};
  font-size: 12px;
  line-height: 14px;
`;

type Props = {
  publicKey: string;
  onItemClick: (publicKey: string) => void;
};

export const TokenRow: FunctionComponent<Props> = ({ publicKey, onItemClick }) => {
  const tokenAccount: TokenAccount = useSelector(
    (state: RootState) => state.entities.tokens.items[publicKey],
  );
  const balanceLamports = useSelector((state: RootState) => state.data.blockchain.balanceLamports);

  // eslint-disable-next-line prefer-const
  let { mint, amount } = tokenAccount?.parsed || { amount: 0 };
  const { name, symbol } = usePopulateTokenInfo({ mint: mint?.toBase58(), includeSol: true });

  if (!mint) {
    amount = balanceLamports / web3.LAMPORTS_PER_SOL;
  }

  const handleClick = () => {
    onItemClick(publicKey);
  };

  return (
    <Wrapper title={publicKey} onClick={handleClick}>
      <ItemWrapper>
        <TokenAvatar mint={mint?.toBase58()} size={32} includeSol />
        <Info>
          <Top>
            <TokenName>{name || publicKey}</TokenName> <div />
          </Top>
          <Bottom>
            <div>{symbol}</div> <div>{amount}</div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
