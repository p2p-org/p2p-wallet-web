import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import Decimal from 'decimal.js';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { Icon, Input } from 'components/ui';
import { RootState } from 'store/rootReducer';
import { getMinimumBalanceForRentExemption } from 'store/slices/wallet/WalletSlice';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 2px;
`;

const InputWrapper = styled.div`
  position: relative;

  margin-top: 15px;
  padding: 0 20px;

  & label {
    height: 48px;

    & input {
      padding-left: 30px;
    }
  }
`;

const SearchIcon = styled(Icon)`
  position: absolute;
  top: 12px;
  left: 40px;

  width: 28px;
  height: 28px;

  color: #a3a5ba;
`;

const EmptyBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 8em 0;
`;

const EmptyBlockText = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const EmptyBlockDesc = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
`;

type Props = {
  items?: Token[];
  closeModal: () => void;
};

export const TokenList: FunctionComponent<Props> = ({ items, closeModal }) => {
  if (!items) {
    return null;
  }

  const dispatch = useDispatch();
  const publicKey = useSelector((state: RootState) => state.wallet.publicKey);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const solAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.toBase58() === publicKey),
    [tokenAccounts, publicKey],
  );

  const [fee, setFee] = useState(0);
  const [rawFee, setRawFee] = useState(0);
  const [filterValue, setFilter] = useState('');

  useEffect(() => {
    const mount = async () => {
      try {
        // TODO: not 0
        const resultFee = unwrapResult(await dispatch(getMinimumBalanceForRentExemption(0)));
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.trim().toLowerCase();
    setFilter(searchValue);
  };

  const filteredItems =
    filterValue.length > 0
      ? items.filter((item) => item.symbol?.toLowerCase().includes(filterValue))
      : items;

  const isInfluencedFunds = Boolean(solAccount?.balance.lt(rawFee));

  return (
    <Wrapper>
      <InputWrapper>
        <SearchIcon name="search" />
        <Input placeholder="Search token" value={filterValue} onChange={handleFilterChange} />
      </InputWrapper>
      {filteredItems.length > 0 ? (
        filteredItems.map((token) => (
          <TokenRow
            key={token.address.toBase58()}
            token={token}
            fee={fee}
            isInfluencedFunds={isInfluencedFunds}
            closeModal={closeModal}
          />
        ))
      ) : (
        <EmptyBlock>
          <Icon name="search" width="100" height="100" />
          <EmptyBlockText>Nothing found</EmptyBlockText>
          <EmptyBlockDesc>Change your search phrase and try again</EmptyBlockDesc>
        </EmptyBlock>
      )}
    </Wrapper>
  );
};
