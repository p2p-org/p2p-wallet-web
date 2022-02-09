import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { u64 } from '@solana/spl-token';
import classNames from 'classnames';
import throttle from 'lodash.throttle';

import type { UserTokenAccountMap } from 'app/contexts/solana/swap';
import { useConfig, usePrice, useSwap } from 'app/contexts/solana/swap';
import type TokenAccount from 'app/contexts/solana/swap/models/TokenAccount';
import type Trade from 'app/contexts/solana/swap/models/Trade';
import { formatBigNumber, getUSDValue, parseString } from 'app/contexts/solana/swap/utils/format';
import { AccountCreationFeeTooltip } from 'components/common/AccountCreationFeeTooltip';
import { Empty } from 'components/common/Empty';
import { SlideContainer } from 'components/common/SlideContainer';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Icon } from 'components/ui';
import { InputAmount } from 'components/ui/InputAmount';
import { SearchInput } from 'components/ui/SearchInput';
import { shortAddress } from 'utils/tokens';

import { AmountUSD } from '../AmountUSD/AmountUSD';
import { TokenAccountRow } from './TokenAccountRow';
import { TokenRow } from './TokenRow';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column; /* to don't collapse margins of children */

  margin-bottom: -1px;
  padding: 16px 20px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

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
  display: flex;
  align-items: center;

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

  margin-top: 8px;
`;

const WalletTokenIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const WalletBalanceIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  margin-right: 5px;
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

    ${WalletTokenIcon} {
      color: #fff;
    }
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;

  margin-left: 12px;
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

const BalanceWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  height: 24px;
`;

const BalanceText = styled.div`
  display: flex;
  align-items: center;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const AmountUSDStyled = styled(AmountUSD)`
  margin-left: 3px;
`;

const DropDownListContainer = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  z-index: 2;

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

const InputWrapper = styled.div`
  display: flex;
`;

const SCROLL_THRESHOLD = 15;

function matchesFilter(str: string, filter: string) {
  return str.toLowerCase().indexOf(filter.toLowerCase().trim()) >= 0;
}

interface Props {
  trade: Trade;
  isInput?: boolean;
  tokenName: string;
  setTokenName: (m: string) => void;
  pairTokenName: string;
  amount: u64;
  setAmount: (a: u64) => void;
  maxAmount?: u64 | undefined;
  disabled?: boolean;
  disabledInput?: boolean;
  isFeeSubtracted?: boolean;
  className?: string;
}

export const SwapTokenForm: FC<Props> = ({
  trade,
  isInput,
  tokenName,
  setTokenName,
  pairTokenName,
  amount,
  setAmount,
  maxAmount,
  disabled,
  disabledInput,
  isFeeSubtracted,
  className,
}) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { tokenConfigs, mintToTokenName } = useConfig();
  const { asyncStandardTokenAccounts } = useSwap();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [scrollTop, setScrollTop] = useState(0);

  const { useAsyncMergedPrices } = usePrice();
  const asyncPrices = useAsyncMergedPrices();

  const hasAsyncStandardTokenAccounts = !!asyncStandardTokenAccounts;

  const tokenInfo = tokenConfigs[tokenName];

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
    setIsOpen(!isOpen);
  };

  const handleAmountChange = (nextAmount: string) => {
    const tokenConfig = tokenConfigs[tokenName];
    const maxDecimals = tokenConfig.decimals;
    setAmount(parseString(nextAmount, maxDecimals));
  };

  const handleFilterChange = (value: string) => {
    const nextFilter = value.trim();

    setFilter(nextFilter);
  };

  const handleTokenAccountClick = (nextTokenAccount: TokenAccount) => {
    setIsOpen(false);

    const mintAddress = nextTokenAccount.accountInfo.mint.toBase58();
    const tokenName = mintToTokenName[mintAddress];
    setTokenName(tokenName);
  };

  const handleTokenClick = useCallback(
    (tokenName: string) => {
      setIsOpen(false);
      setTokenName(tokenName);
    },
    [setTokenName],
  );

  const filteredTokenAccounts = useMemo((): TokenAccount[] => {
    if (!asyncStandardTokenAccounts) {
      return [];
    }

    const tokenAccounts = Object.entries(asyncStandardTokenAccounts).reduce(
      (tokenAccountMap, [tokenName, tokenAccount]) => {
        tokenAccountMap[tokenName] = tokenAccount;
        return tokenAccountMap;
      },
      {} as UserTokenAccountMap,
    );

    // Token with balance in from selector
    let filteredWithBalance = Object.values(asyncStandardTokenAccounts);
    if (isInput) {
      filteredWithBalance = Object.entries(tokenAccounts)
        .filter(([_, tokenAccount]) => tokenAccount.getAmount().gtn(0))
        .map(([_, tokenAccount]) => tokenAccount);
    }

    return filteredWithBalance
      .filter((account) => {
        const mintAddress = account.accountInfo.mint.toBase58();
        const tokenSymbol = mintToTokenName[mintAddress];

        if (tokenSymbol === pairTokenName || tokenSymbol === tokenName) {
          return false;
        }

        if (filter === '') {
          return true;
        }

        return (
          matchesFilter(tokenSymbol, filter) ||
          matchesFilter(tokenConfigs[tokenSymbol].name, filter)
        );
      })
      .sort((a, b) => b.getAmount().cmp(a.getAmount()))
      .sort((a, b) => {
        const mintAddressA = a.accountInfo.mint.toBase58();
        const tokenSymbolA = mintToTokenName[mintAddressA];

        const mintAddressB = b.accountInfo.mint.toBase58();
        const tokenSymbolB = mintToTokenName[mintAddressB];

        // const aUSD = toDecimal(a.getAmount())
        //   .div(10 ** tokenConfigs[tokenSymbolA].decimals)
        //   .toDecimalPlaces(tokenConfigs[tokenSymbolA].decimals);
        //
        // const bUSD = toDecimal(b.getAmount())
        //   .div(10 ** tokenConfigs[tokenSymbolB].decimals)
        //   .toDecimalPlaces(tokenConfigs[tokenSymbolB].decimals);
        // return aUSD.cmp(bUSD);

        const aUSD = getUSDValue(
          a.getAmount(),
          tokenConfigs[tokenSymbolA].decimals,
          asyncPrices.value?.[tokenSymbolA] || 0,
        );
        const bUSD = getUSDValue(
          b.getAmount(),
          tokenConfigs[tokenSymbolB].decimals,
          asyncPrices.value?.[tokenSymbolB] || 0,
        );

        return bUSD < aUSD ? -1 : a === b ? 0 : 1;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    asyncPrices.value,
    hasAsyncStandardTokenAccounts,
    filter,
    isInput,
    mintToTokenName,
    pairTokenName,
    tokenConfigs,
    tokenName,
  ]);

  const filteredTokens = useMemo(
    () =>
      Object.entries(tokenConfigs)
        .filter(([tokenSymbol]) => tokenSymbol !== pairTokenName && tokenSymbol !== tokenName)
        .filter(
          // Exclude liquidity tokens
          ([tokenSymbol]) => !tokenSymbol.includes('/'),
        )
        .filter(([tokenSymbol]) => {
          if (filter === '') {
            return true;
          }

          return (
            matchesFilter(tokenSymbol, filter) ||
            matchesFilter(tokenConfigs[tokenSymbol].name, filter)
          );
        })
        .filter(([_, config]) => {
          return !filteredTokenAccounts.find((tokenAccount) =>
            tokenAccount.accountInfo.mint.equals(config.mint),
          );
        })
        .map(([tokenSymbol]) => tokenSymbol),
    [tokenConfigs, pairTokenName, tokenName, filter, filteredTokenAccounts],
  );

  return (
    <Wrapper className={className}>
      <TopWrapper>
        <FromTitle>{isInput ? 'From' : 'To'} </FromTitle>
        <BalanceText>
          {maxAmount ? (
            isInput ? (
              <AllBalance
                onClick={() => setAmount(maxAmount)}
                className={classNames({ disabled, error: !maxAmount })}
              >
                <WalletBalanceIcon name="wallet" />
                {formatBigNumber(maxAmount, tokenConfigs[tokenName].decimals)} {tokenName}
              </AllBalance>
            ) : (
              <>
                <WalletBalanceIcon name="wallet" />
                {formatBigNumber(maxAmount || new u64(0), tokenConfigs[tokenName].decimals)}{' '}
                {tokenName}
              </>
            )
          ) : undefined}
        </BalanceText>
      </TopWrapper>
      <MainWrapper>
        <TokenAvatarWrapper className={classNames({ isOpen: isOpen && !tokenName })}>
          {tokenName ? (
            <TokenAvatar address={tokenInfo?.mint.toString()} size={44} />
          ) : (
            <WalletTokenIcon name="wallet" />
          )}
        </TokenAvatarWrapper>
        <InfoWrapper>
          <SpecifyTokenWrapper>
            <TokenWrapper
              ref={selectorRef}
              onClick={handleSelectorClick}
              className={classNames({ isOpen })}
            >
              <TokenName title={tokenInfo?.mint.toString()}>
                {tokenName || (tokenInfo?.mint && shortAddress(tokenInfo.mint.toString())) || (
                  <EmptyName>—</EmptyName>
                )}
              </TokenName>
              <ChevronWrapper>
                <ChevronIcon name="arrow-triangle" />
              </ChevronWrapper>
            </TokenWrapper>
            <InputWrapper>
              <InputAmount
                placeholder={Number(0).toFixed(tokenInfo?.decimals || 0)}
                value={formatBigNumber(amount, tokenInfo?.decimals || 0)}
                onChange={handleAmountChange}
                disabled={disabled || disabledInput}
              />
              {isFeeSubtracted ? <AccountCreationFeeTooltip /> : undefined}
            </InputWrapper>
          </SpecifyTokenWrapper>
          <BalanceWrapper>
            {!amount.eqn(0) ? (
              <BalanceText>
                ≈ <AmountUSDStyled amount={amount} tokenName={tokenName} />
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
            }}
          >
            <Title>Select token</Title>
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
                    key={account.account.toBase58()}
                    tokenAccount={account}
                    onClick={handleTokenAccountClick}
                  />
                ))}
              </>
            ) : undefined}
            {!isInput && filteredTokens?.length ? (
              <>
                <AllTokens>All tokens</AllTokens>
                {filteredTokens.map((token) => (
                  <TokenRow key={token} tokenName={token} onClick={handleTokenClick} />
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
