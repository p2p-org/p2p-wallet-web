import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import { AccountLayout } from '@solana/spl-token';
import Decimal from 'decimal.js';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { WidgetPage } from 'components/common/WidgetPage';
import { getMinimumBalanceForRentExemption } from 'store/slices/wallet/WalletSlice';

import { SelectTokenAccount } from './SelectTokenAccount';
import { TokenAccountQR } from './TokenAccountQR';

const WrapperWidgetPage = styled(WidgetPage)``;

export const ReceiveAddressWidget: FunctionComponent = () => {
  const dispatch = useDispatch();
  const [fee, setFee] = useState(0);
  const [rawFee, setRawFee] = useState(0);
  const availableTokenAccounts = useSelector((state) =>
    state.wallet.tokenAccounts.map((itemToken) => TokenAccount.from(itemToken)),
  );
  const availableTokens = useSelector((state) =>
    state.global.availableTokens.map((itemToken) => Token.from(itemToken)),
  );
  const publicKey = useSelector((state) => state.wallet.publicKey);
  const solAccount = useMemo(
    () => availableTokenAccounts.find((account) => account.address.toBase58() === publicKey),
    [availableTokenAccounts, publicKey],
  );
  const [token, setToken] = useState<Token | undefined>(solAccount?.mint);
  const [tokenAccount, setTokenAccount] = useState<TokenAccount | null | undefined>(solAccount);

  const tokenAccounts = useMemo(() => {
    const sortedUniqTokenAccounts = availableTokenAccounts
      .sort((a, b) => b.balance.cmp(a.balance))
      .filter(
        (value, index, self) =>
          value.mint.symbol && index === self.findIndex((t) => t.sameToken(value)),
      );

    return sortedUniqTokenAccounts;
  }, [availableTokenAccounts]);

  const tokens = useMemo(() => {
    // get tokens not included in sortedUniqTokenAccounts
    return availableTokens.filter(
      (itemToken) =>
        itemToken.symbol?.toLowerCase() !== 'wsol' &&
        !tokenAccounts.find((itemTokenAccount) => itemTokenAccount.mint.equals(itemToken)),
    );
  }, [availableTokens, tokenAccounts]);

  useEffect(() => {
    if (!token && !tokenAccount && solAccount) {
      setToken(solAccount.mint);
      setTokenAccount(solAccount);
    }
  }, [solAccount]);

  useEffect(() => {
    const mount = async () => {
      try {
        // TODO: not 0
        const resultFee = unwrapResult(
          await dispatch(getMinimumBalanceForRentExemption(AccountLayout.span)),
        );
        setRawFee(resultFee);
        setFee(
          new Decimal(resultFee)
            .div(10 ** 9)
            .toDecimalPlaces(9)
            .toNumber(),
        );
      } catch (error) {
        console.log(error);
      }
    };

    void mount();
  }, []);

  const handleTokenAccountChange = (
    selectedToken: Token,
    selectedAccountToken: TokenAccount | null,
  ) => {
    setToken(selectedToken);
    setTokenAccount(selectedAccountToken);
  };

  const isInfluencedFunds = Boolean(solAccount?.balance.lt(rawFee));

  return (
    <WrapperWidgetPage title="Receive" icon="bottom">
      <SelectTokenAccount
        tokens={tokens}
        tokenAccounts={tokenAccounts}
        token={token}
        tokenAccount={tokenAccount}
        onTokenAccountChange={handleTokenAccountChange}
      />
      {token ? (
        <TokenAccountQR
          key={token.address.toBase58()}
          token={token}
          tokenAccount={tokenAccount}
          onTokenAccountCreate={handleTokenAccountChange}
          fee={fee}
          isInfluencedFunds={isInfluencedFunds}
        />
      ) : undefined}
    </WrapperWidgetPage>
  );
};
