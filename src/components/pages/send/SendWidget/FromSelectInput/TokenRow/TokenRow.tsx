import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { TokenAvatar } from 'components/common/TokenAvatar';
import { RootState, TokenAccount } from 'store/types';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';

const Wrapper = styled.div`
  padding: 15px 32px;

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
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
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

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 17px;
`;

type Props = {
  publicKey: string;
  onClick: (publicKey: string) => void;
};

export const TokenRow: FunctionComponent<Props> = ({ publicKey, onClick }) => {
  const tokenAccount: TokenAccount = useSelector(
    (state: RootState) => state.entities.tokens.items[publicKey],
  );
  const balance = useSelector((state: RootState) => state.data.blockchain.balance);

  // eslint-disable-next-line prefer-const
  let { mint, amount } = tokenAccount?.parsed || {};
  const { name, symbol } = usePopulateTokenInfo({ mint: mint?.toBase58() });

  let address;

  if (!mint) {
    address = publicKey;
    amount = balance;
  } else {
    address = mint.toBase58();
  }

  const handleClick = () => {
    onClick(publicKey);
  };

  return (
    <Wrapper onClick={handleClick}>
      <ItemWrapper>
        <TokenAvatar mint={mint?.toBase58()} size={44} />
        <Info>
          <Top>
            <TokenName>{name || mint?.toBase58()}</TokenName> <div />
          </Top>
          <Bottom>
            <div>{symbol}</div> <div>{amount}</div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
