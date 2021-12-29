import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import type { Token } from 'api/token/Token';
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

const TokenName = styled.div`
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
  token: Token;
  onClick: (token: Token) => void;
};

export const TokenRow: FunctionComponent<Props> = ({ token, onClick }) => {
  const handleClick = () => {
    onClick(token);
  };

  return (
    <Wrapper onClick={handleClick}>
      <ItemWrapper>
        <TokenAvatar symbol={token.symbol} address={token.address.toBase58()} size={44} />
        <Info>
          <Top>
            <TokenName title={token.address.toBase58()}>
              {token.symbol || shortAddress(token.address.toBase58())}
            </TokenName>
          </Top>
          <Bottom>
            <div>{token.name}</div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
