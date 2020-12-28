import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { Decimal } from 'decimal.js';
import { rgba } from 'polished';

import { TokenAccount } from 'api/token/TokenAccount';
import { AmountUSDT } from 'components/common/AmountUSDT';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Icon } from 'components/ui';
import { RootState } from 'store/rootReducer';
import { minorAmountToMajor } from 'utils/amount';
import { shortAddress } from 'utils/tokens';

import { TokenRow } from './TokenRow';

const Wrapper = styled.div`
  position: relative;

  padding: 0 0 20px;
`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 17px;
`;

const FromTitle = styled.div``;

const AllBalance = styled.div`
  text-decoration: underline;

  cursor: pointer;

  &.disabled {
    cursor: auto;

    pointer-events: none;
  }
`;

const MainWrapper = styled.div`
  display: flex;

  margin-top: 20px;
`;

const TokenAvatarWrapper = styled.div``;

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

const TokenWrapper = styled.div`
  display: flex;
  min-width: 0;

  cursor: pointer;
`;

const TokenName = styled.div`
  max-width: 200px;
  overflow: hidden;

  color: #000;
  font-weight: 500;
  font-size: 22px;
  line-height: 26px;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ChevronWrapper = styled.div``;

const ChevronIcon = styled(Icon)`
  width: 11px;
  height: 8px;
  margin-left: 16px;

  color: #000;
`;

const AmountInput = styled.input`
  max-width: 200px;

  color: #000;
  font-weight: 500;
  font-size: 28px;
  line-height: 33px;
  text-align: right;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  &::placeholder {
    color: #c2c2c2;
  }
`;

const BalanceWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;

  color: ${rgba('#000', 0.3)};
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.3px;
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

  margin-top: 17px;

  background: #fefefe;
  border: 1px solid #efefef;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
`;

const DropDownHeader = styled.div`
  display: flex;
  padding: 15px 32px;

  color: #000;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
`;

const SearchCircle = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #f5f5f5;
  border-radius: 50%;
`;

const SearchIcon = styled(Icon)`
  width: 24px;
  height: 24px;
`;

const SearchInput = styled.input`
  width: 100%;
  margin-left: 20px;

  color: #000;
  font-size: 14px;
  line-height: 17px;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  &::placeholder {
    color: ${rgba('#000', 0.5)};
  }
`;

const DropDownList = styled.div`
  max-height: 400px;
  overflow-y: auto;

  > :not(:last-child) {
    border-bottom: 1px solid ${rgba('#000', 0.05)};
  }
`;

type Props = {
  type?: 'send' | 'swap';
  direction?: 'from' | 'to';
  tokenAccount?: TokenAccount;
  amount?: string;
  onTokenAccountChange: (tokenAccount: TokenAccount) => void;
  onAmountChange: (minorAmount: string) => void;
  disabled?: boolean;
};

export const FromToSelectInput: FunctionComponent<Props> = ({
  type = 'send',
  direction = 'from',
  tokenAccount,
  amount,
  onTokenAccountChange,
  onAmountChange,
  disabled,
}) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('');
  const [localAmount, setLocalAmount] = useState(`${amount}`);
  const [isOpen, setIsOpen] = useState(false);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );

  useEffect(() => {
    if (amount && amount !== localAmount) {
      setLocalAmount(amount);
    }
  }, [amount]);

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFilter = e.target.value.trim();

    setFilter(nextFilter);
  };

  return (
    <Wrapper>
      <TopWrapper>
        <FromTitle>{direction === 'from' ? 'From' : 'To'}</FromTitle>
        {direction === 'from' ? (
          <AllBalance onClick={handleAllBalanceClick} className={classNames({ disabled })}>
            Use all balance
          </AllBalance>
        ) : undefined}
      </TopWrapper>
      <MainWrapper>
        <TokenAvatarWrapper>
          <TokenAvatar symbol={tokenAccount?.mint.symbol} size={44} />
        </TokenAvatarWrapper>
        <InfoWrapper>
          <SpecifyTokenWrapper>
            <TokenWrapper ref={selectorRef} onClick={handleSelectorClick}>
              <TokenName title={tokenAccount?.address.toBase58()}>
                {tokenAccount?.mint.symbol ||
                  (tokenAccount && shortAddress(tokenAccount.address.toBase58()))}
              </TokenName>
              <ChevronWrapper>
                <ChevronIcon name="arrow-triangle" />
              </ChevronWrapper>
            </TokenWrapper>
            <AmountInput
              placeholder="0"
              value={localAmount}
              onChange={handleAmountChange}
              disabled={disabled || direction === 'to'}
            />
          </SpecifyTokenWrapper>
          <BalanceWrapper>
            <BalanceText>
              Balance = {tokenAccount?.mint.toMajorDenomination(tokenAccount.balance)}{' '}
              {tokenAccount?.mint.symbol}
            </BalanceText>
            <BalanceText>
              ={' '}
              <AmountUSDTStyled
                value={new Decimal(localAmount || 0)}
                symbol={tokenAccount?.mint.symbol}
              />
            </BalanceText>
          </BalanceWrapper>
        </InfoWrapper>
      </MainWrapper>
      {isOpen ? (
        <DropDownListContainer ref={dropdownRef}>
          <DropDownHeader>
            <SearchCircle>
              <SearchIcon name="search" />
            </SearchCircle>
            <SearchInput
              placeholder={`Search for currency to ${type}`}
              onChange={handleFilterChange}
            />
          </DropDownHeader>
          <DropDownList>
            {tokenAccounts
              .filter((account) => direction === 'to' || account.balance.toNumber() > 0)
              .filter(
                (account) =>
                  !filter ||
                  account.mint.symbol?.toLowerCase().includes(filter) ||
                  account.mint.name?.toLowerCase().includes(filter),
              )
              .sort((a, b) => b.balance.cmp(a.balance))
              .map((account) => (
                <TokenRow
                  key={account.address.toBase58()}
                  tokenAccount={account}
                  onClick={handleItemClick}
                />
              ))}
          </DropDownList>
        </DropDownListContainer>
      ) : undefined}
    </Wrapper>
  );
};
