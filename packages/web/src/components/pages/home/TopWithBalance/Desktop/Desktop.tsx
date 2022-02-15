import type { FC } from 'react';

import { styled } from '@linaria/react';

import { TotalBalance } from 'components/pages/home/TopWithBalance/common/TotalBalance';

import walletImg from './wallet.png';

const Wrapper = styled.div`
  position: relative;

  padding: 28px 24px;
  margin-top: 29px;

  background: #e6fdee;
  border-radius: 16px;
`;

const WalletImg = styled.img`
  position: absolute;
  right: 22px;
  bottom: 0;

  width: 147px;
  height: 147px;
`;

interface Props {}

export const Desktop: FC<Props> = () => {
  return (
    <Wrapper>
      <TotalBalance />
      <WalletImg src={walletImg} />
    </Wrapper>
  );
};
