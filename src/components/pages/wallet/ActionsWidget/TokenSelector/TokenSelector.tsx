import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { Icon } from 'components/ui';
import { getOwnedTokenAccounts } from 'store/actions/solana';
import { RootState } from 'store/types';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';

import { TokenRow } from './TokenRow';

const Wrapper = styled.div``;

const Selector = styled.div`
  display: flex;
  align-items: center;

  cursor: pointer;
`;

const Value = styled.div`
  max-width: 300px;
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
  min-width: 302px;
  margin-top: 17px;
  padding: 5px 0;

  background: #464646;
  box-shadow: 0 12px 16px rgba(0, 0, 0, 0.15);
  border-radius: 10px;

  > :not(:last-child) {
    border-bottom: 1px solid ${rgba('#000', 0.05)};
  }
`;

type Props = {
  value: string;
  onChange: (token: string) => void;
};

export const TokenSelector: FunctionComponent<Props> = ({ value, onChange }) => {
  const dispatch = useDispatch();
  const selectorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const order = useSelector((state: RootState) => state.entities.tokens.order);

  const { name, mint } = usePopulateTokenInfo({ mint: value });

  useEffect(() => {
    dispatch(getOwnedTokenAccounts());
  }, []);

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
    if (!order) {
      return;
    }

    setIsOpen(!isOpen);
  };

  const handleItemClick = (token) => {
    setIsOpen(false);
    onChange(token);
  };

  return (
    <Wrapper ref={selectorRef}>
      <Selector onClick={handleSelectorClick}>
        <Value title={name || mint}>{name || mint}</Value>
        {order ? (
          <ChevronWrapper>
            <ChevronIcon name="chevron" />
          </ChevronWrapper>
        ) : undefined}
      </Selector>
      {isOpen ? (
        <DropDownList>
          {order.map((publicKey) => (
            <TokenRow key={publicKey} publicKey={publicKey} onItemClick={handleItemClick} />
          ))}
        </DropDownList>
      ) : undefined}
    </Wrapper>
  );
};
