import React, { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { rgba } from 'polished';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { Card } from 'components/common/Card';
import { Icon } from 'components/ui';

import { TokenList } from '../common/TokenList';

const Wrapper = styled(Card)`
  padding: 0;

  box-shadow: 0 4px 4px #f6f6f9;
`;

const Title = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 18px;
  line-height: 120%;
`;

const Action = styled.div``;

const Content = styled.div``;

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

  &:hover {
    background: #f6f6f8;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;

  cursor: pointer;

  &:not(:last-child) {
    border-bottom: 1px solid ${rgba(0, 0, 0, 0.05)};
  }

  &:hover {
    ${Title} {
      color: #5887ff;
    }
  }

  &.isOpen,
  &:hover {
    ${ChevronWrapper} {
      background: #f6f6f8;
    }
  }

  &.isOpen {
    ${ChevronWrapper} {
      transform: rotate(0deg);
    }
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
      (token) => !sortedUniqTokenAccounts.find((tokenAccount) => tokenAccount.mint.equals(token)),
    );
  }, [availableTokens, tokenAccounts]);

  const handleChevronClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Wrapper>
      <Header className={classNames({ isOpen })} onClick={handleChevronClick}>
        <Title>Receive to a new wallet</Title>
        <Action>
          <ChevronWrapper>
            <ChevronIcon name="chevron" />
          </ChevronWrapper>
        </Action>
      </Header>
      {isOpen ? (
        <Content>
          <TokenList items={tokens} />
        </Content>
      ) : undefined}
    </Wrapper>
  );
};
