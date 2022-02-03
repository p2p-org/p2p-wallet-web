import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { theme } from '@p2p-wallet-web/ui';
import type { Token } from '@saberhq/token-utils';
import classNames from 'classnames';
import throttle from 'lodash.throttle';

import { useMarketsData } from 'app/contexts';
import { Empty } from 'components/common/Empty';
import { SlideContainer } from 'components/common/SlideContainer';
import { TokenAccountRow } from 'components/common/TokenAccountRow';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Icon } from 'components/ui';
import { SearchInput } from 'components/ui/SearchInput';
import { matchesFilter, shortAddress, sortByRules } from 'utils/tokens';

const Wrapper = styled.div``;

const SelectorWrapper = styled.div`
  display: flex;
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

const TokenName = styled.div`
  max-width: 200px;
  overflow: hidden;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 20px;
  line-height: 100%;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;

  width: 24px;
  height: 24px;
  margin-left: 4px;
`;

const ChevronIcon = styled(Icon)`
  color: ${theme.colors.textIcon.secondary};
`;

const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;

  cursor: pointer;

  &.isOpen {
    ${TokenName}, ${ChevronIcon} {
      color: #5887ff;
    }
  }
`;

const EmptyName = styled.div`
  color: #a3a5ba;
`;

const DropDownListContainer = styled.div`
  position: absolute;
  top: 100%;
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

const SCROLL_THRESHOLD = 15;

interface Props {
  tokenAccounts: readonly TokenAccount[];
  tokenAccount?: TokenAccount | null;
  direction?: 'from' | 'to';
  onTokenAccountChange: (token: Token, tokenAccount: TokenAccount | null) => void;
}

export const TokenSelector: FC<Props> = ({
  tokenAccounts,
  tokenAccount,
  direction,
  onTokenAccountChange,
}) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [scrollTop, setScrollTop] = useState(0);

  const symbols = useMemo(() => {
    return tokenAccounts.map((tokenAccount) => tokenAccount.balance?.token.symbol);
  }, [tokenAccounts]);
  const markets = useMarketsData(symbols);

  const boxShadow = useMemo(() => {
    return `0 5px 10px rgba(56, 60, 71, ${
      scrollTop >= SCROLL_THRESHOLD ? '0.05' : 0.003 * scrollTop
    }`;
  }, [scrollTop]);

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
    const element = listRef.current;

    if (!element) {
      return;
    }

    element.addEventListener('scroll', handleScroll);

    return () => {
      if (!element) {
        return;
      }

      element.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, listRef.current]);

  const handleSelectorClick = () => {
    if (!tokenAccounts) {
      return;
    }

    setIsOpen(!isOpen);
  };

  const handleFilterChange = (value: string) => {
    const nextFilter = value.trim();

    setFilter(nextFilter);
  };

  const filteredTokenAccounts = useMemo(() => {
    if (!tokenAccounts) {
      return [];
    }

    // Token with balance in from selector
    let filteredWithBalance = tokenAccounts;
    if (direction === 'from') {
      filteredWithBalance = tokenAccounts.filter((account) => account.balance?.greaterThan(0));
    }

    return filteredWithBalance
      .filter(
        (account) =>
          account.balance &&
          (matchesFilter(account.balance.token.symbol, filter) ||
            matchesFilter(account.balance.token.name, filter)),
      )
      .sort(sortByRules(markets));
  }, [tokenAccounts, direction, filter, markets]);

  // const handleTokenClick = (nextToken: Token) => {
  //   setIsOpen(false);
  //   onTokenAccountChange(nextToken, null);
  // };

  const handleTokenAccountClick = (nextTokenAccount: TokenAccount) => {
    if (!nextTokenAccount.balance) {
      return;
    }

    setIsOpen(false);
    onTokenAccountChange(nextTokenAccount.balance?.token, nextTokenAccount);
  };

  return (
    <Wrapper>
      <SelectorWrapper>
        <TokenAvatarWrapper className={classNames({ isOpen: isOpen && !tokenAccount?.key })}>
          {tokenAccount?.balance?.token ? (
            <TokenAvatar
              symbol={tokenAccount.balance.token.symbol}
              address={tokenAccount.balance.token.address}
              size={44}
            />
          ) : (
            <WalletIcon name="wallet" />
          )}
        </TokenAvatarWrapper>
        <TokenWrapper
          ref={selectorRef}
          onClick={handleSelectorClick}
          className={classNames({ isOpen })}
        >
          <TokenName title={tokenAccount?.balance?.token.address}>
            {tokenAccount?.balance?.token.symbol ||
              (tokenAccount?.key && shortAddress(tokenAccount.key.toBase58())) || (
                <EmptyName>—</EmptyName>
              )}
          </TokenName>
          <ChevronWrapper>
            <ChevronIcon name="arrow-triangle" />
          </ChevronWrapper>
        </TokenWrapper>
      </SelectorWrapper>
      {isOpen ? (
        <DropDownListContainer ref={dropdownRef}>
          <DropDownHeader
            style={{
              boxShadow,
            }}
          >
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
                {filteredTokenAccounts.map(
                  (account) =>
                    account.key && (
                      <TokenAccountRow
                        key={account.key.toBase58()}
                        tokenAccount={account}
                        onClick={handleTokenAccountClick}
                      />
                    ),
                )}
              </>
            ) : undefined}
            {!filteredTokenAccounts?.length ? <Empty type="search" /> : undefined}
          </DropDownList>
        </DropDownListContainer>
      ) : undefined}
    </Wrapper>
  );
};
