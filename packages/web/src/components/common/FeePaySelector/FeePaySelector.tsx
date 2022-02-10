import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { shadows, theme } from '@p2p-wallet-web/ui';
import type { Token } from '@saberhq/token-utils';
import classNames from 'classnames';

import { useMarketsData } from 'app/contexts';
import { Empty } from 'components/common/Empty';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Icon } from 'components/ui';
import { SearchInput } from 'components/ui/SearchInput';
import { matchesFilter, sortByRules } from 'utils/tokens';

import { TokenAccountRow } from './TokenAccountRow';

const Wrapper = styled.div`
  position: relative;
`;

const MainWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  padding: 12px 20px;

  border: 1px solid ${theme.colors.stroke.secondary};
  border-radius: 12px;
  cursor: pointer;

  &.isOpen {
    border-color: ${theme.colors.textIcon.active};
  }
`;

const SelectedWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const InfoWrapper = styled.div`
  display: grid;
  grid-gap: 8px;

  margin-left: 12px;
`;

const Line = styled.div`
  line-height: 17px;
`;

const Text = styled.div`
  display: inline-block;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 14px;
  line-height: 120%;
  letter-spacing: 0.01em;

  &.gray {
    color: ${theme.colors.textIcon.secondary};
  }
`;

const ChevronIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: ${theme.colors.textIcon.secondary};

  &.isOpen {
    color: ${theme.colors.textIcon.active};

    transform: rotate(180deg);
  }
`;

const DropDownListContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  z-index: 1;

  padding: 8px;
  overflow: hidden;

  background: ${theme.colors.bg.primary};
  border-radius: 8px;
  ${shadows.notification};
`;

const DropDownHeader = styled.div`
  padding-bottom: 8px;

  backdrop-filter: blur(15px);
`;

const DropDownList = styled.div`
  display: grid;
  grid-gap: 8px;
  max-height: 400px;
  overflow-y: auto;

  &.isShortList {
    max-height: 200px;
  }
`;

interface Props {
  tokenAccounts: readonly TokenAccount[];
  onTokenAccountChange: (token: Token, tokenAccount: TokenAccount | null) => void;
  isShortList?: boolean;
}

export const FeePaySelector: FC<Props> = ({ tokenAccounts, onTokenAccountChange, isShortList }) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const symbols = useMemo(() => {
    return tokenAccounts.map((tokenAccount) => tokenAccount.balance?.token.symbol);
  }, [tokenAccounts]);
  const markets = useMarketsData(symbols);

  const handleAwayClick = (e: MouseEvent) => {
    if (
      !selectorRef.current?.contains(e.target as HTMLDivElement) &&
      !dropdownRef.current?.contains(e.target as HTMLDivElement)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleAwayClick, true);

    return () => {
      window.removeEventListener('click', handleAwayClick, true);
    };
  }, []);

  const handleFilterChange = (value: string) => {
    const nextFilter = value.trim();

    setFilter(nextFilter);
  };

  const filteredTokenAccounts = useMemo(() => {
    if (!tokenAccounts) {
      return [];
    }

    const filteredWithBalance = tokenAccounts.filter((account) => account.balance?.greaterThan(0));

    return filteredWithBalance
      .filter(
        (account) =>
          account.balance &&
          (matchesFilter(account.balance.token.symbol, filter) ||
            matchesFilter(account.balance.token.name, filter)),
      )
      .sort(sortByRules(markets));
  }, [tokenAccounts, filter, markets]);

  const handleTokenAccountClick = (nextTokenAccount: TokenAccount) => {
    if (!nextTokenAccount.balance) {
      return;
    }

    setIsOpen(false);
    onTokenAccountChange(nextTokenAccount.balance?.token, nextTokenAccount);
  };

  return (
    <Wrapper>
      <MainWrapper
        ref={selectorRef}
        onClick={() => setIsOpen((state) => !state)}
        className={classNames({ isOpen })}
      >
        <SelectedWrapper>
          <div>
            <TokenAvatar symbol="SOL" size={44} />
          </div>
          <InfoWrapper>
            <Line>
              <Text className="gray">USDC account creation:</Text> <Text>~$0.5</Text>
            </Line>
            <Line>
              <Text className="gray">Pay with:</Text> <Text>0.509 USDC</Text>
            </Line>
          </InfoWrapper>
        </SelectedWrapper>
        <ChevronIcon name="chevron" className={classNames({ isOpen })} />
      </MainWrapper>
      {isOpen ? (
        <DropDownListContainer ref={dropdownRef}>
          <DropDownHeader>
            <SearchInput
              placeholder="Search for token"
              value={filter}
              onChange={handleFilterChange}
            />
          </DropDownHeader>
          <DropDownList ref={listRef} className={classNames({ isShortList })}>
            {filteredTokenAccounts?.length ? (
              <>
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
