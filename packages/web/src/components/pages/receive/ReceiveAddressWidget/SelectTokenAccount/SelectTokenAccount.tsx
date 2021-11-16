import type { FunctionComponent } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import throttle from 'lodash.throttle';

import type { Token } from 'api/token/Token';
import type { TokenAccount } from 'api/token/TokenAccount';
import { Empty } from 'components/common/Empty';
import { SlideContainer } from 'components/common/SlideContainer';
import { TokenAccountRow } from 'components/common/TokenAccountRow';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { TokenRow } from 'components/common/TokenRow';
import { Icon } from 'components/ui';
import { SearchInput } from 'components/ui/SearchInput';
import { shortAddress } from 'utils/tokens';

const Wrapper = styled.div`
  position: relative;

  margin: 20px;
`;

const MainWrapper = styled.div`
  display: flex;

  padding: 10px 12px;

  background: #f6f6f8;
  border: 1px solid transparent;
  border-radius: 12px;

  cursor: pointer;

  &.isOpen {
    border-color: rgba(163, 165, 186, 0.5);
  }
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
  justify-content: center;
  min-width: 0;

  margin-left: 16px;
`;

const TokenName = styled.div`
  overflow: hidden;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const TokenAccountAddress = styled.div`
  overflow: hidden;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const EmptyName = styled.div`
  color: #a3a5ba;
`;

const ChevronIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;

  margin-left: 26px;

  &.isOpen {
    transform: rotate(180deg);

    ${ChevronIcon} {
      color: #000;
    }
  }
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

const FiltersWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  height: 66px;

  & > :not(:last-child) {
    margin-right: 12px;
  }
`;

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
  tokens?: Token[];
  tokenAccounts: TokenAccount[];
  token?: Token;
  tokenAccount?: TokenAccount | null;
  onTokenAccountChange: (token: Token, tokenAccount: TokenAccount | null) => void;
  className?: string;
};

const SCROLL_THRESHOLD = 15;

export const SelectTokenAccount: FunctionComponent<Props> = ({
  tokens,
  tokenAccounts,
  token,
  tokenAccount,
  onTokenAccountChange,
  className,
}) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

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

  const handleTokenAccountClick = (nextTokenAccount: TokenAccount) => {
    setIsOpen(false);
    onTokenAccountChange(nextTokenAccount.mint, nextTokenAccount);
  };

  const handleTokenClick = (nextToken: Token) => {
    setIsOpen(false);
    onTokenAccountChange(nextToken, null);
  };

  const handleFilterChange = (value: string) => {
    const nextFilter = value.trim();

    setFilter(nextFilter);
  };

  const filteredTokenAccounts = useMemo(() => {
    if (!tokenAccounts) {
      return [];
    }

    if (!filter) {
      return tokenAccounts;
    }

    const filterLower = filter.toLowerCase();

    return tokenAccounts
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
      (token) =>
        token.symbol?.toLowerCase().includes(filterLower) ||
        token.name?.toLowerCase().includes(filterLower),
    );
  }, [tokens, filter]);

  return (
    <Wrapper className={className}>
      <MainWrapper
        ref={selectorRef}
        onClick={handleSelectorClick}
        className={classNames({ isOpen })}>
        <TokenAvatarWrapper className={classNames({ isOpen: isOpen && !token })}>
          {token ? (
            <TokenAvatar symbol={token.symbol} address={token.address.toBase58()} size={40} />
          ) : (
            <WalletIcon name="wallet" />
          )}
        </TokenAvatarWrapper>
        <InfoWrapper>
          <TokenName title={token?.address.toBase58()}>
            {token?.symbol || (tokenAccount && shortAddress(tokenAccount.address.toBase58())) || (
              <EmptyName>—</EmptyName>
            )}
          </TokenName>
          {tokenAccount ? (
            <TokenAccountAddress>
              {shortAddress(tokenAccount.address.toBase58())}
            </TokenAccountAddress>
          ) : (
            <TokenAccountAddress>Add token to your list to see token address</TokenAccountAddress>
          )}
        </InfoWrapper>
        <ChevronWrapper className={classNames({ isOpen })}>
          <ChevronIcon name="arrow-triangle" />
        </ChevronWrapper>
      </MainWrapper>
      {isOpen ? (
        <DropDownListContainer ref={dropdownRef}>
          <DropDownHeader
            style={{
              boxShadow,
            }}>
            <SlideContainer>
              <FiltersWrapper>
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
                <YourTokens>Your tokens</YourTokens>
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
