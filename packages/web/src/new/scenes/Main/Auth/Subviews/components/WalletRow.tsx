import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Fiat } from 'new/app/models/Fiat';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';

export const Wrapper = styled.div`
  padding: 10px 0;

  cursor: pointer;
`;

export const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 44px;
`;

export const Info = styled.div`
  flex: 1;
  margin-left: 20px;
`;

export const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`;

export const TokenSymbol = styled.div`
  max-width: 300px;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

type Props = {
  wallet: Wallet;
};

export const WalletRow: FC<Props> = (props) => {
  return (
    <Wrapper>
      <ItemWrapper>
        <TokenAvatar size={44} token={props.wallet.token} />
        <Info>
          <Top>
            <TokenSymbol>{props.wallet.token.symbol}</TokenSymbol>
            <div>{Fiat.usd.symbol}</div>
          </Top>
          <Bottom>
            <div>{props.wallet.shortAddress}</div>
            {/*<div>{props.tokenAccount.balance?.formatUnits()}</div>*/}
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
