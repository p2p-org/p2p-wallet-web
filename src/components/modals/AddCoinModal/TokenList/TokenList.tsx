import React, { FunctionComponent, useState } from 'react';

import { styled } from '@linaria/react';

import { Token } from 'api/token/Token';
import { SearchInput } from 'components/ui/SearchInput';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 2px;
`;

const SearchInputStyled = styled(SearchInput)`
  margin: 15px 20px 0;
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

  const handleFilterChange = (value: string) => {
    const searchValue = value.trim().toLowerCase();
    setFilter(searchValue);
  };

  const filteredItems =
    filterValue.length > 0
      ? items.filter(
          (item) =>
            item.symbol?.toLowerCase().includes(filterValue) ||
            item.name?.toLowerCase().includes(filterValue),
        )
      : items;

  return (
    <Wrapper>
      <SearchInputStyled
        placeholder="Search token"
        value={filterValue}
        onChange={handleFilterChange}
      />
      {filteredItems.map((token) => (
        <TokenRow key={token.address.toBase58()} token={token} closeModal={closeModal} />
      ))}
    </Wrapper>
  );
};
