import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import type { HomeViewModel } from 'new/scenes/Main/Home';

import { BalanceView } from '../common/BalanceView';
import walletImg from './wallet.png';

const Wrapper = styled.div`
  position: relative;

  margin-top: 29px;

  padding: 28px 24px;

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

interface Props {
  viewModel: Readonly<HomeViewModel>;
}

export const Desktop: FC<Props> = observer(({ viewModel }) => {
  return (
    <Wrapper>
      <BalanceView viewModel={viewModel} />
      <WalletImg src={walletImg} />
    </Wrapper>
  );
});
