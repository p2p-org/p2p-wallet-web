import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { Avatar } from 'components/ui';
import { RootState, TokenAccount } from 'store/types';
import { populateTokenInfo } from 'utils/tokens';

const Wrapper = styled.div`
  padding: 15px 12px;

  cursor: pointer;
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 35px;
`;

const AvatarStyled = styled(Avatar)`
  width: 32px;
  height: 32px;
  margin-right: 12px;

  background: #888;
`;

const Info = styled.div`
  flex: 1;
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
  onItemClick: () => void;
};

export const TokenRow: FunctionComponent<Props> = ({ publicKey, onItemClick }) => {
  const entrypoint = useSelector((state: RootState) => state.data.blockchain.entrypoint);
  const tokenAccount: TokenAccount = useSelector(
    (state: RootState) => state.entities.tokens.items[publicKey],
  );

  const handleClick = () => {
    onItemClick(publicKey);
  };

  const { mint, owner, amount } = tokenAccount.parsed;
  const { name, symbol, icon } = populateTokenInfo({ mint, entrypoint });

  return (
    <Wrapper onClick={handleClick}>
      <ItemWrapper>
        <AvatarStyled src={icon} />
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
