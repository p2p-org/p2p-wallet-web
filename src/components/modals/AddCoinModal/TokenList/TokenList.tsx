import React, { FunctionComponent, useState } from 'react';

import { styled } from '@linaria/react';

import { Token } from 'api/token/Token';
import { Icon, Input } from 'components/ui';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 2px;
`;

const InputWrapper = styled.div`
  position: relative;

  margin-top: 15px;
  padding: 0 30px;

  & label {
    height: 48px;

    & input {
      padding-left: 30px;
    }
  }
`;

const SearchIcon = styled(Icon)`
  position: absolute;
  top: 12px;
  left: 40px;

  width: 28px;
  height: 28px;

  color: #a3a5ba;
`;

type Props = {
  items?: Token[];
  closeModal: () => void;
};

export const TokenList: FunctionComponent<Props> = ({ items, closeModal }) => {
  if (!items) {
    return null;
  }

  const [filterValue, setFilter] = useState('');

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.trim().toLowerCase();
    setFilter(searchValue);
  };

  const filteredItems =
    filterValue.length > 0
      ? items.filter((item) => item.symbol?.toLowerCase().includes(filterValue))
      : items;

  return (
    <Wrapper>
      <InputWrapper>
        <SearchIcon name="search" />
        <Input placeholder="Search token" value={filterValue} onChange={handleFilterChange} />
      </InputWrapper>
      {filteredItems.map((token) => (
        <TokenRow key={token.address.toBase58()} token={token} closeModal={closeModal} />
      ))}
    </Wrapper>
  );
};
