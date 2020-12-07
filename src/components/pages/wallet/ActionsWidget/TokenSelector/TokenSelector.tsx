import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { TokenAccount } from 'api/token/TokenAccount';
import { Icon } from 'components/ui';
import { RootState } from 'store/rootReducer';
import { useTokenInfo } from 'utils/hooks/useTokenInfo';
import { shortAddress } from 'utils/tokens';

import { TokenRow } from './TokenRow';

const Wrapper = styled.div``;

const Selector = styled.div`
  display: flex;
  align-items: center;

  cursor: pointer;
`;

const Value = styled.div`
  max-width: 230px;
  overflow: hidden;

  color: #000;
  font-weight: 500;
  font-size: 22px;
  line-height: 120%;
  white-space: nowrap;

  text-overflow: ellipsis;
`;

const ChevronWrapper = styled.div`
  margin-left: 12px;
`;

const ChevronIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: #000;
`;

const DropDownList = styled.div`
  position: absolute;
  z-index: 1;

  min-width: 302px;
  margin-top: 17px;
  padding: 5px 0;

  background: #464646;
  border-radius: 10px;
  box-shadow: 0 12px 16px rgba(0, 0, 0, 0.15);

  > :not(:last-child) {
    border-bottom: 1px solid ${rgba('#000', 0.05)};
  }
`;

type Props = {
  value: string;
  onChange: (token: string) => void;
};

export const TokenSelector: FunctionComponent<Props> = ({ value, onChange }) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const tokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.toBase58() === value),
    [tokenAccounts, value],
  );

  // const preparedOrder = useMemo(() => (publicKey ? [publicKey, ...order] : order), [
  //   publicKey,
  //   order,
  // ]);

  const handleAwayClick = (e: MouseEvent) => {
    if (!selectorRef.current?.contains(e.target as HTMLDivElement)) {
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

  const handleItemClick = (newPublicKey: string) => {
    setIsOpen(false);
    onChange(newPublicKey);
  };

  return (
    <Wrapper ref={selectorRef}>
      <Selector onClick={handleSelectorClick}>
        <Value title={value}>{tokenAccount?.mint.name || shortAddress(value)}</Value>
        {tokenAccounts ? (
          <ChevronWrapper>
            <ChevronIcon name="chevron" />
          </ChevronWrapper>
        ) : undefined}
      </Selector>
      {isOpen ? (
        <DropDownList>
          {tokenAccounts.map((item) => (
            <TokenRow key={item} token={item} onItemClick={handleItemClick} />
          ))}
        </DropDownList>
      ) : undefined}
    </Wrapper>
  );
};
