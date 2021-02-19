import React, { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { Widget } from 'components/common/Widget';
import { TokenRow } from 'components/pages/receive/common/TokenRow';

const WrapperWidget = styled(Widget)``;

const Title = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 18px;
  line-height: 120%;
`;

export const ReceiveWalletsWidget: FC = () => {
  const tokenAccounts = useSelector((state) =>
    state.wallet.tokenAccounts.map((token) => TokenAccount.from(token)),
  );
  const initialTokenAccount = tokenAccounts.find(
    (tokenAccount) => tokenAccount.mint.symbol === 'SOL',
  );

  const renderToken = useCallback((token: Token, tokenAccount: TokenAccount) => {
    return (
      <TokenRow
        token={token}
        tokenAccount={tokenAccount}
        isSelected={initialTokenAccount?.equals(tokenAccount)}
      />
    );
  }, []);

  const renderedTokens = useMemo(() => {
    // sort, uniq, and with symbol
    const sortedUniqTokenAccounts = tokenAccounts
      .sort((a, b) => b.balance.cmp(a.balance))
      .filter(
        (value, index, self) =>
          value.mint.symbol && index === self.findIndex((t) => t.sameToken(value)),
      );

    return sortedUniqTokenAccounts.map((tokenAccount) =>
      renderToken(tokenAccount.mint, tokenAccount),
    );
  }, [tokenAccounts]);

  return <WrapperWidget title={<Title>My wallets</Title>}>{renderedTokens}</WrapperWidget>;
};
