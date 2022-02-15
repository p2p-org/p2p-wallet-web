import type { FC } from 'react';

import { styled } from '@linaria/react';

import { TokenAvatar } from 'components/common/TokenAvatar';
import { shortAddress } from 'utils/tokens';

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  padding: 11px 12px;
`;

const AccountAddress = styled.span`
  margin-left: 16px;

  color: #161616;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;
`;

interface Props {
  account: string;
}

export const SelectorAccountItem: FC<Props> = ({ account }) => {
  return (
    <Wrapper>
      <TokenAvatar symbol="SOL" size="32" />{' '}
      <AccountAddress>{shortAddress(account)}</AccountAddress>
    </Wrapper>
  );
};
