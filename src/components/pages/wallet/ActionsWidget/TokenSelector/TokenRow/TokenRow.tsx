import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { Avatar } from 'components/ui';
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
  onItemClick: (publicKey: string) => void;
};

export const TokenRow: FunctionComponent<Props> = ({ publicKey, onItemClick }) => {
  const tokenAccount: TokenAccount = useSelector(
    (state: RootState) => state.entities.tokens.items[publicKey],
  );

  const { mint, amount } = tokenAccount.parsed;
  const { name, symbol, icon } = usePopulateTokenInfo({ mint: mint?.toBase58() });

  const handleClick = () => {
    onItemClick(publicKey);
  };

  return (
    <Wrapper title={publicKey} onClick={handleClick}>
      <ItemWrapper>
        <AvatarStyled src={icon} />
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
