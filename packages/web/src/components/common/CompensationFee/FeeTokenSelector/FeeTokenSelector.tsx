import type { FC } from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import type { TokenAmount } from '@p2p-wallet-web/token-utils';
import { theme } from '@p2p-wallet-web/ui';

import { AmountUSD } from 'components/common/AmountUSD';
import { TokenAccountRowContent } from 'components/common/TokenAccountRowContent';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Select, SelectItem } from 'components/ui';

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

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;

  &.primary {
    color: ${theme.colors.textIcon.primary};
    font-size: 16px;
  }
`;

const SwapLabelWrapper = styled.div`
  display: grid;
  grid-row-gap: 2px;
`;

const Amount = styled.span``;

const AmountUSDStyled = styled(AmountUSD)`
  display: inline-flex;
`;

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
      mobileListTitle="Pay swap fees with"
      value={
        <SelectorValue>
          <TokenAvatarStyled
            symbol={selectedTokenSymbol}
            address={value?.balance?.token.address}
            size={44}
          />
          <Fees>
            <Top>
              {isSend ? (
                <Label>{accountSymbol as string} account creation:</Label>
              ) : (
                <SwapLabelWrapper>
                  <Label>Pay swap fees with</Label>
                  <Label className="primary">{selectedTokenSymbol}</Label>
                </SwapLabelWrapper>
              )}
              {isSend && feeAmount ? (
                <Amount>
                  <AmountUSDStyled value={feeAmount} />
                </Amount>
              ) : undefined}
            </Top>
            {isSend && feeAmount ? (
              <Bottom>
                <Label>Pay with:</Label>
                <Amount>{feeAmount.formatUnits()}</Amount>
              </Bottom>
            ) : undefined}
          </Fees>
        </SelectorValue>
      }
    >
      {feeTokenAccounts.map((item: TokenAccount) => (
        <SelectItem
          key={item.key?.toBase58()}
          onItemClick={onItemClick(item)}
          isSelected={item.balance?.token.symbol === selectedTokenSymbol}
        >
          <TokenAccountRowContent tokenAccount={item} isMobilePopupChild />
        </SelectItem>
      ))}
    </Select>
  );
};
