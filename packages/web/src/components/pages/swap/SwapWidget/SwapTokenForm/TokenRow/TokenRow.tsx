import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';

import { useConfig } from 'app/contexts/solana/swap';
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
  tokenName: string;
  onClick: (tokenName: string) => void;
};

export const TokenRow: FunctionComponent<Props> = ({ tokenName, onClick }) => {
  const { tokenConfigs } = useConfig();
  const tokenInfo = tokenConfigs[tokenName];

  const handleClick = () => {
    onClick(tokenName);
  };

  return (
    <Wrapper onClick={handleClick}>
      <ItemWrapper>
        <TokenAvatar symbol={tokenName} address={tokenInfo?.mint.toString()} size={44} />
        <Info>
          <Top>
            <TokenSymbol title={tokenInfo?.mint.toString()}>
              {tokenName || shortAddress(tokenInfo?.mint.toString())}
            </TokenSymbol>
          </Top>
          <Bottom>
            <div>{tokenInfo?.name}</div>
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
