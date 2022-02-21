import type { FC } from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import type { TokenAmount } from '@saberhq/token-utils';

import { AmountUSD } from 'components/common/AmountUSD';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Select } from 'components/ui';

const SelectorValue = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const TokenAvatarStyled = styled(TokenAvatar)`
  margin-right: 12px;
`;

const Fees = styled.div`
  flex-grow: 1;
`;

const Top = styled.div``;

const Bottom = styled.div``;

const Label = styled.span`
  margin-right: 4px;

  color: #8e8e93;
`;

const Amount = styled.span``;

const FeeTokenItemWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;

  font-size: 16px;

  border-radius: 12px;
  cursor: pointer;

  &:not(:last-child) {
    border-bottom: 1px solid #f6f6f8;
  }

  &:hover {
    background: #f6f6f8;
  }

  ${Top} {
    font-weight: 600;
  }
`;

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AmountUSDStyled = styled(AmountUSD)`
  display: inline-flex;
`;

const FeeTokenItem: FC<{
  item: TokenAccount;
  onItemClick: (item: TokenAccount) => void;
  close?: () => void;
}> = ({ item, onItemClick, close = () => {} }) => {
  const handleItemClick = () => {
    onItemClick(item);
    close();
  };

  return (
    <FeeTokenItemWrapper onClick={handleItemClick}>
      <TokenAvatarStyled
        symbol={item?.balance?.token.symbol}
        address={item?.balance?.token.address}
        size={40}
      />
      <TokenInfo>
        <Top>{item?.balance?.token.symbol}</Top>
        <Bottom>{item?.balance?.token.name}</Bottom>
      </TokenInfo>
    </FeeTokenItemWrapper>
  );
};

type Props = {
  type: 'send' | 'swap';
  feeTokenAccounts: TokenAccount[];
  value: TokenAccount | null | undefined;
  feeAmountInSol: TokenAmount | undefined;
  feeTokenAmount: TokenAmount | undefined;
  accountSymbol?: string | undefined;
  onSelectToken: (token: TokenAccount) => void;
};

export const FeeTokenSelector: FC<Props> = ({
  type,
  value,
  feeTokenAccounts,
  feeAmountInSol,
  feeTokenAmount,
  accountSymbol,
  onSelectToken,
}) => {
  const onItemClick = (item: TokenAccount) => () => {
    onSelectToken(item);
  };

  const isSend = type === 'send';
  const selectedTokenSymbol = value?.balance?.token.symbol || '';
  const feeAmount = selectedTokenSymbol === 'SOL' ? feeAmountInSol : feeTokenAmount;

  return (
    <Select
      flat
      value={
        <SelectorValue>
          <TokenAvatarStyled
            symbol={selectedTokenSymbol}
            address={value?.balance?.token.address}
            size={40}
          />
          <Fees>
            <Top>
              <Label>
                {isSend
                  ? `${accountSymbol as string} account creation:`
                  : `Pay swap fees with:  ${selectedTokenSymbol}`}
              </Label>
              {isSend && feeAmount ? (
                <Amount>
                  <AmountUSDStyled value={feeAmount} />
                </Amount>
              ) : undefined}
            </Top>
            {isSend && feeAmount ? (
              <Bottom>
                <Label>Pay with:</Label>
                <Amount>{`${feeAmount.formatUnits()}`}</Amount>
              </Bottom>
            ) : undefined}
          </Fees>
        </SelectorValue>
      }
    >
      {feeTokenAccounts.map((item: TokenAccount) => (
        <FeeTokenItem key={item.key?.toBase58()} item={item} onItemClick={onItemClick(item)} />
      ))}
    </Select>
  );
};
