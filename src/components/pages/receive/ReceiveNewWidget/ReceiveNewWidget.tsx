import React, { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { Widget } from 'components/common/Widget';
import { Icon } from 'components/ui';

import { TokenList } from '../common/TokenList';

const WrapperWidget = styled(Widget)``;

const Title = styled.div`
  color: #5887ff;
  font-weight: 600;
  font-size: 18px;
  line-height: 120%;
`;

const ChevronIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: #a3a5ba;
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  border-radius: 8px;
  transform: rotate(-90deg);
  cursor: pointer;

  &:hover {
    background: #f6f6f8;
  }

  &.isOpen {
    background: #f6f6f8;
    transform: rotate(0deg);
  }
`;

export const ReceiveNewWidget: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const tokenAccounts = useSelector((state) =>
    state.wallet.tokenAccounts.map((token) => TokenAccount.from(token)),
  );
  const availableTokens = useSelector((state) =>
    state.global.availableTokens.map((token) => Token.from(token)),
  );
  const initialTokenAccount = tokenAccounts.find(
    (tokenAccount) => tokenAccount.mint.symbol === 'SOL',
  );
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(initialTokenAccount?.mint);

  const tokens = useMemo(() => {
    // sort, uniq, and with symbol
    const sortedUniqTokenAccounts = tokenAccounts
      .sort((a, b) => b.balance.cmp(a.balance))
      .filter(
        (value, index, self) =>
          value.mint.symbol && index === self.findIndex((t) => t.sameToken(value)),
      );

    // get tokens not included in sortedUniqTokenAccounts
    return availableTokens.filter(
      (token) =>
        !sortedUniqTokenAccounts.find(
          (tokenAccount) =>
            tokenAccount.mint.equals(token) && !selectedToken?.equals(tokenAccount.mint),
        ),
    );
  }, [selectedToken, availableTokens, tokenAccounts]);

  const handleChevronClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (token?: Token) => {
    setSelectedToken(token);
  };

  return (
    <WrapperWidget
      title={<Title>Receive to a new wallet</Title>}
      action={
        <ChevronWrapper onClick={handleChevronClick} className={classNames({ isOpen })}>
          <ChevronIcon name="chevron" />
        </ChevronWrapper>
      }>
      {isOpen ? (
        <TokenList items={tokens} selectedToken={selectedToken} onSelect={handleSelect} />
      ) : undefined}
    </WrapperWidget>
  );
};
