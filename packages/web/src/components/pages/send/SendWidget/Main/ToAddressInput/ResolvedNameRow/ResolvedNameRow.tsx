import type { FC } from 'react';

import { styled } from '@linaria/react';

import type { ResolveUsernameResponse } from 'app/contexts';
import { AddressText } from 'components/common/AddressText';

import { IconWrapper, WalletIcon } from '../common/styled';

const Wrapper = styled.div`
  display: flex;

  cursor: pointer;
`;

const NameAddress = styled.div`
  display: flex;
  flex-direction: column;

  margin-left: 12px;
`;

const Name = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

interface Props {
  item: ResolveUsernameResponse;
  onClick: (item: ResolveUsernameResponse) => void;
}

export const ResolvedNameRow: FC<Props> = ({ item, onClick }) => {
  const handleClick = () => {
    onClick(item);
  };

  return (
    <Wrapper key={item.name} onClick={handleClick}>
      <IconWrapper>
        <WalletIcon name="wallet" />
      </IconWrapper>
      <NameAddress>
        <Name>{item.name}</Name>
        <AddressText address={item.owner} small gray />
      </NameAddress>
    </Wrapper>
  );
};
