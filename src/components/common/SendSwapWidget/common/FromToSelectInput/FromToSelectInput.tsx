import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { Decimal } from 'decimal.js';
import throttle from 'lodash.throttle';
import { isNil } from 'ramda';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { AmountUSD } from 'components/common/AmountUSD';
import { SlideContainer } from 'components/common/SlideContainer';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Icon } from 'components/ui';
import { SearchInput } from 'components/ui/SearchInput';
import { majorAmountToMinor, minorAmountToMajor } from 'utils/amount';
import { shortAddress } from 'utils/tokens';

import { Empty } from '../../../Empty';
import { TokenAccountRow } from '../../../TokenAccountRow';
import { TokenRow } from '../../../TokenRow';

const Wrapper = styled.div``;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FromTitle = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const AllBalance = styled.div`
  color: #5887ff;

  cursor: pointer;

  &.disabled {
    cursor: auto;

    pointer-events: none;
  }

  &.error {
    color: #f43d3d;
  }
`;

const MainWrapper = styled.div`
  display: flex;

  margin-top: 20px;
`;

const WalletIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const TokenAvatarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #f6f6f8;
  border-radius: 12px;

  &.isOpen {
    background: #5887ff;

    ${WalletIcon} {
      color: #fff;
    }
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;

  margin-left: 20px;
`;

const SpecifyTokenWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
`;

const TokenName = styled.div`
  max-width: 200px;
  overflow: hidden;

  color: #000;
  font-weight: 600;
  font-size: 24px;
  line-height: 140%;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const EmptyName = styled.div`
  color: #a3a5ba;
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;

  margin-left: 26px;
`;

const ChevronIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #000;
`;

const TokenWrapper = styled.div`
  display: flex;
  min-width: 0;

  cursor: pointer;

  &.isOpen {
    ${TokenName}, ${ChevronIcon} {
      color: #5887ff;
    }
  }
`;

const AmountInput = styled.input`
  max-width: 200px;

  color: #000;
  font-weight: 600;
  font-size: 28px;
  line-height: 120%;
  text-align: right;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  &::placeholder {
    color: #a3a5ba;
  }
`;

const BalanceWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 3px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const BalanceText = styled.div`
  display: flex;
`;

const AmountUSDStyled = styled(AmountUSD)`
  margin-left: 3px;
`;

const DropDownListContainer = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  z-index: 1;

  margin-top: 8px;
  overflow: hidden;

  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.1);
`;

const DropDownHeader = styled.div`
  padding: 0 20px;

  border-radius: 0 0 12px 12px;
  box-shadow: none;
  backdrop-filter: blur(15px);
`;

const Title = styled.div`
  padding: 12px 0;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

const FiltersWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  height: 66px;

  & > :not(:last-child) {
    margin-right: 12px;
  }
`;

//
// Uncomment in the future
//
// const FilterName = styled.div`
//   display: flex;
//   align-items: center;
//   height: 34px;
//   padding: 0 12px;
//
//   color: #a3a5ba;
//   font-weight: 600;
//   font-size: 13px;
//   line-height: 140%;
//   white-space: nowrap;
//
//   background: rgba(163, 165, 186, 0.1);
//   border-radius: 12px;
//
//   cursor: pointer;
//
//   &.active {
//     color: #fff;
//
//     background: #5887ff;
//   }
// `;
//
// const SearchCircle = styled.div`
//   display: flex;
//   flex-shrink: 0;
//   align-items: center;
//   justify-content: center;
//   width: 34px;
//   height: 34px;
//
//   background: #f6f6f8;
//   border-radius: 12px;
//   cursor: pointer;
// `;
//
// const SearchIcon = styled(Icon)`
//   width: 24px;
//   height: 24px;
//
//   color: #a3a5ba;
// `;

const DropDownList = styled.div`
  max-height: 400px;
  padding-bottom: 14px;
  overflow-y: auto;
`;

const TitleTokens = styled.div`
  display: flex;
  align-items: center;
  margin: 0 20px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

const YourTokens = styled(TitleTokens)`
  height: 32px;
`;

const AllTokens = styled(TitleTokens)`
  height: 44px;
`;

type Props = {
  direction?: 'from' | 'to';
  tokens?: Token[];
  tokenAccounts: TokenAccount[];
  token?: Token;
  tokenAccount?: TokenAccount;
  amount?: string;
  feeAmount?: Decimal | number;
  onTokenAccountChange: (token: Token, tokenAccount: TokenAccount | null) => void;
  onAmountChange: (minorAmount: string, type?: 'available') => void;
  disabled?: boolean;
  disabledInput?: boolean;
  className?: string;
};

const SCROLL_THRESHOLD = 15;

export const FromToSelectInput: FunctionComponent<Props> = ({
  direction = 'from',
  tokens,
  tokenAccounts,
  token,
  tokenAccount,
  amount,
  feeAmount,
  onTokenAccountChange,
  onAmountChange,
  disabled,
  disabledInput,
  className,
}) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('');
  const [localAmount, setLocalAmount] = useState(String(amount));
  const [isOpen, setIsOpen] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (amount && amount !== localAmount) {
      setLocalAmount(amount);
    }
  }, [amount]);

  const handleScroll = throttle(() => {
    if (!listRef.current) {
      return;
    }

    if (listRef.current.scrollTop <= SCROLL_THRESHOLD) {
      setScrollTop(listRef.current.scrollTop);
    } else {
      setScrollTop(SCROLL_THRESHOLD);
    }
  }, 100);

  const boxShadow = useMemo(() => {
    return `0 5px 10px rgba(56, 60, 71, ${
      scrollTop >= SCROLL_THRESHOLD ? '0.05' : 0.003 * scrollTop
    }`;
  }, [scrollTop]);

  const handleAwayClick = (e: MouseEvent) => {
    if (
      !selectorRef.current?.contains(e.target as HTMLDivElement) &&
      !dropdownRef.current?.contains(e.target as HTMLDivElement)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleAwayClick);

    return () => {
      window.removeEventListener('click', handleAwayClick);
    };
  }, []);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.addEventListener('scroll', handleScroll);

    return () => {
      if (!listRef.current) {
        return;
      }

      listRef.current.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, listRef.current]);

  const handleSelectorClick = () => {
    if (!tokenAccounts) {
      return;
    }

    setIsOpen(!isOpen);
  };

  const handleTokenAccountClick = (nextTokenAccount: TokenAccount) => {
    setIsOpen(false);
    onTokenAccountChange(nextTokenAccount.mint, nextTokenAccount);
  };

  const handleTokenClick = (nextToken: Token) => {
    setIsOpen(false);
    onTokenAccountChange(nextToken, null);
  };

  const handleAllBalanceClick = () => {
    if (!tokenAccount) {
      return;
    }

    let tokenAccountBalance = tokenAccount.balance;

    if (tokenAccount.mint.symbol === 'SOL' && feeAmount) {
      const fee = majorAmountToMinor(feeAmount, tokenAccount.mint);
      const balanceWithoutFee = tokenAccount.balance.minus(fee);

      tokenAccountBalance = balanceWithoutFee.gt(0) ? balanceWithoutFee : new Decimal(0);
    }

    onAmountChange(
      minorAmountToMajor(tokenAccountBalance, tokenAccount.mint).toString(),
      'available',
    );
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let nextAmount = e.target.value
      .replace(',', '.')
      .replace(/[^\d.]/g, '')
      .replace(/^(\d*\.?)|(\d*)\.?/g, '$1$2');

    if (nextAmount === '.') {
      nextAmount = '0.';
    }

    setLocalAmount(nextAmount);

    if (!isNil(Number(nextAmount))) {
      onAmountChange(nextAmount);
    }
  };

  const handleFilterChange = (value: string) => {
    const nextFilter = value.trim();

    setFilter(nextFilter);
  };

  const renderBalance = () => {
    if (!tokenAccount) {
      return null;
    }

    if (tokenAccount.mint.symbol === 'SOL' && feeAmount) {
      const fee = majorAmountToMinor(feeAmount, tokenAccount.mint);
      const balanceWithoutFee = tokenAccount.balance.minus(fee);

      return `${tokenAccount.mint
        .toMajorDenomination(balanceWithoutFee.gt(0) ? balanceWithoutFee : 0)
        .toString()} ${tokenAccount?.mint.symbol}`;
    }

    return `${tokenAccount?.mint.toMajorDenomination(tokenAccount.balance).toString()} ${
      tokenAccount?.mint.symbol
    }`;
  };

  const filteredTokenAccounts = useMemo(() => {
    if (!tokenAccounts) {
      return [];
    }

    // Token with balance in from selector
    let filteredWithBalance = tokenAccounts;
    if (direction === 'from') {
      filteredWithBalance = tokenAccounts.filter((account) => account.balance.gt(0));
    }

    if (!filter) {
      return filteredWithBalance;
    }

    const filterLower = filter.toLowerCase();
    return filteredWithBalance
      .filter(
        (account) =>
          account.mint.symbol?.toLowerCase().includes(filterLower) ||
          account.mint.name?.toLowerCase().includes(filterLower),
      )
      .sort((a, b) => b.balance.cmp(a.balance));
  }, [tokenAccounts, filter]);

  const filteredTokens = useMemo(() => {
    if (!tokens) {
      return [];
    }

    if (!filter) {
      return tokens;
    }

    const filterLower = filter.toLowerCase();

    return tokens.filter(
      (itemToken) =>
        itemToken.symbol?.toLowerCase().includes(filterLower) ||
        itemToken.name?.toLowerCase().includes(filterLower),
    );
  }, [tokens, filteredTokenAccounts, filter]);

  const hasBalance = tokenAccount
    ? tokenAccount.mint.toMajorDenomination(tokenAccount.balance).toNumber() >= Number(localAmount)
    : false;

  return (
    <Wrapper className={className}>
      <TopWrapper>
        <FromTitle>{direction === 'from' ? 'From' : 'To'}</FromTitle>
      </TopWrapper>
      <MainWrapper>
        <TokenAvatarWrapper className={classNames({ isOpen: isOpen && !token })}>
          {token ? <TokenAvatar symbol={token.symbol} size={44} /> : <WalletIcon name="wallet" />}
        </TokenAvatarWrapper>
        <InfoWrapper>
          <SpecifyTokenWrapper>
            <TokenWrapper
              ref={selectorRef}
              onClick={handleSelectorClick}
              className={classNames({ isOpen })}>
              <TokenName title={token?.address.toBase58()}>
                {token?.symbol ||
                  (tokenAccount && shortAddress(tokenAccount.address.toBase58())) || (
                    <EmptyName>—</EmptyName>
                  )}
              </TokenName>
              <ChevronWrapper>
                <ChevronIcon name="arrow-triangle" />
              </ChevronWrapper>
            </TokenWrapper>
            <AmountInput
              placeholder={token?.toMajorDenomination(0).toString() || '0'}
              value={localAmount}
              onChange={handleAmountChange}
              disabled={disabled || disabledInput}
            />
          </SpecifyTokenWrapper>
          <BalanceWrapper>
            <BalanceText>
              {token && tokenAccount ? (
                direction === 'from' && !disabled ? (
                  <AllBalance
                    onClick={handleAllBalanceClick}
                    className={classNames({ disabled, error: !hasBalance })}>
                    Available: {renderBalance()}
                  </AllBalance>
                ) : (
                  <>Balance: {renderBalance()}</>
                )
              ) : undefined}
              {!token ? 'Select currency' : undefined}
            </BalanceText>
            {token ? (
              <BalanceText>
                ≈ <AmountUSDStyled value={new Decimal(localAmount || 0)} symbol={token?.symbol} />
              </BalanceText>
            ) : undefined}
          </BalanceWrapper>
        </InfoWrapper>
      </MainWrapper>
      {isOpen ? (
        <DropDownListContainer ref={dropdownRef}>
          <DropDownHeader
            style={{
              boxShadow,
            }}>
            <Title>Select token</Title>
            <SlideContainer>
              <FiltersWrapper>
                {/* Uncomment in the future */}
                {/* <SearchCircle> */}
                {/*  <SearchIcon name="search" /> */}
                {/* </SearchCircle> */}
                {/* <FilterName>All</FilterName> */}
                {/* <FilterName>My tokens set</FilterName> */}
                {/* <FilterName>Token Exchange</FilterName> */}
                {/* <FilterName>Aave</FilterName> */}
                {/* <FilterName>Compound</FilterName> */}
                {/* <FilterName>Last</FilterName> */}
                <SearchInput
                  placeholder="Search for token"
                  value={filter}
                  onChange={handleFilterChange}
                />
              </FiltersWrapper>
            </SlideContainer>
          </DropDownHeader>
          <DropDownList ref={listRef}>
            {filteredTokenAccounts?.length ? (
              <>
                {direction === 'to' ? <YourTokens>Your tokens</YourTokens> : undefined}
                {filteredTokenAccounts.map((account) => (
                  <TokenAccountRow
                    key={account.address.toBase58()}
                    tokenAccount={account}
                    onClick={handleTokenAccountClick}
                  />
                ))}
              </>
            ) : undefined}
            {filteredTokens?.length ? (
              <>
                <AllTokens>All tokens</AllTokens>
                {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
                {filteredTokens.map((token) => (
                  <TokenRow
                    key={token.address.toBase58()}
                    token={token}
                    onClick={handleTokenClick}
                  />
                ))}
              </>
            ) : undefined}
            {!filteredTokenAccounts?.length && !filteredTokens?.length ? (
              <Empty type="search" />
            ) : undefined}
          </DropDownList>
        </DropDownListContainer>
      ) : undefined}
    </Wrapper>
  );
};
