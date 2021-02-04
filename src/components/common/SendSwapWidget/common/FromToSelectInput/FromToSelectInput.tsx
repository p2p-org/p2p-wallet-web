import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import emptyImg from 'assets/images/empty.png';
import classNames from 'classnames';
import { Decimal } from 'decimal.js';
import throttle from 'lodash.throttle';

import { TokenAccount } from 'api/token/TokenAccount';
import { AmountUSDT } from 'components/common/AmountUSDT';
import { SlideContainer } from 'components/common/SlideContainer';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Icon } from 'components/ui';
import { SearchInput } from 'components/ui/SearchInput';
import { minorAmountToMajor } from 'utils/amount';
import { shortAddress } from 'utils/tokens';

import { TokenRow } from './TokenRow';

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

const AmountUSDTStyled = styled(AmountUSDT)`
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

const EmptyWrapper = styled.div`
  margin: 50px 0;

  text-align: center;
`;

const EmptyImg = styled.img`
  width: 82px;
  height: 78px;
`;

const EmptyTitle = styled.div`
  margin-top: 12px;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`;

const EmptyDescription = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

type Props = {
  // type?: 'send' | 'swap';
  direction?: 'from' | 'to';
  tokenAccounts: TokenAccount[];
  tokenAccount?: TokenAccount;
  amount?: string;
  onTokenAccountChange: (tokenAccount: TokenAccount) => void;
  onAmountChange: (minorAmount: string) => void;
  disabled?: boolean;
  className?: string;
};

const SCROLL_THRESHOLD = 15;

export const FromToSelectInput: FunctionComponent<Props> = ({
  // type = 'send',
  direction = 'from',
  tokenAccounts,
  tokenAccount,
  amount,
  onTokenAccountChange,
  onAmountChange,
  disabled,
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

  const handleItemClick = (nextTokenAccount: TokenAccount) => {
    setIsOpen(false);
    onTokenAccountChange(nextTokenAccount);
  };

  const handleAllBalanceClick = () => {
    if (!tokenAccount) {
      return;
    }

    onAmountChange(minorAmountToMajor(tokenAccount.balance, tokenAccount.mint).toString());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let nextAmount = e.target.value.replace(/[^\d.]/g, '').replace(/^(\d*\.?)|(\d*)\.?/g, '$1$2');

    if (nextAmount === '.') {
      nextAmount = '0.';
    }

    setLocalAmount(nextAmount);

    if (Number(nextAmount)) {
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

    return `${tokenAccount?.mint.toMajorDenomination(tokenAccount.balance)} ${
      tokenAccount?.mint.symbol
    }`;
  };

  const filteredTokens = useMemo(() => {
    if (!tokenAccounts) {
      return;
    }

    const filterLower = filter.toLowerCase();

    return tokenAccounts
      .filter((account) => direction === 'to' || account.balance.toNumber() > 0)
      .filter(
        (account) =>
          !filter ||
          account.mint.symbol?.toLowerCase().includes(filterLower) ||
          account.mint.name?.toLowerCase().includes(filterLower),
      )
      .sort((a, b) => b.balance.cmp(a.balance));
  }, [tokenAccounts, direction, filter]);

  const renderEmpty = () => {
    return (
      <EmptyWrapper>
        <EmptyImg src={emptyImg as string} />
        <EmptyTitle>Nothing found</EmptyTitle>
        <EmptyDescription>Change your search phrase and try again</EmptyDescription>
      </EmptyWrapper>
    );
  };

  const hasBalance = tokenAccount
    ? Number(tokenAccount.mint.toMajorDenomination(tokenAccount.balance)) >= Number(localAmount)
    : false;

  return (
    <Wrapper className={className}>
      <TopWrapper>
        <FromTitle>{direction === 'from' ? 'From' : 'To'}</FromTitle>
      </TopWrapper>
      <MainWrapper>
        <TokenAvatarWrapper className={classNames({ isOpen: isOpen && !tokenAccount })}>
          {tokenAccount ? (
            <TokenAvatar symbol={tokenAccount?.mint.symbol} size={44} />
          ) : (
            <WalletIcon name="wallet" />
          )}
        </TokenAvatarWrapper>
        <InfoWrapper>
          <SpecifyTokenWrapper>
            <TokenWrapper
              ref={selectorRef}
              onClick={handleSelectorClick}
              className={classNames({ isOpen })}>
              <TokenName title={tokenAccount?.address.toBase58()}>
                {tokenAccount?.mint.symbol ||
                  (tokenAccount && shortAddress(tokenAccount.address.toBase58())) || (
                    <EmptyName>—</EmptyName>
                  )}
              </TokenName>
              <ChevronWrapper>
                <ChevronIcon name="arrow-triangle" />
              </ChevronWrapper>
            </TokenWrapper>
            <AmountInput
              placeholder={tokenAccount?.mint.toMajorDenomination(0) || '0'}
              value={localAmount}
              onChange={handleAmountChange}
              disabled={disabled || direction === 'to'}
            />
          </SpecifyTokenWrapper>
          <BalanceWrapper>
            <BalanceText>
              {tokenAccount ? (
                direction === 'from' && !disabled ? (
                  <AllBalance
                    onClick={handleAllBalanceClick}
                    className={classNames({ disabled, error: !hasBalance })}>
                    Available: {renderBalance()}
                  </AllBalance>
                ) : (
                  <>Balance: {renderBalance()}</>
                )
              ) : (
                'Select currency'
              )}
            </BalanceText>
            {tokenAccount ? (
              <BalanceText>
                ≈{' '}
                <AmountUSDTStyled
                  value={new Decimal(localAmount || 0)}
                  symbol={tokenAccount?.mint.symbol}
                />
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
            {filteredTokens?.length
              ? filteredTokens.map((account) => (
                  <TokenRow
                    key={account.address.toBase58()}
                    tokenAccount={account}
                    onClick={handleItemClick}
                  />
                ))
              : renderEmpty()}
          </DropDownList>
        </DropDownListContainer>
      ) : undefined}
    </Wrapper>
  );
};
