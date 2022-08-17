import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { Button } from 'components/ui';
import type { HomeViewModel } from 'new/scenes/Main/Home';
import { featureFlags, Features } from 'new/services/FetureFlags';

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

const TestFeatureButton = () => {
  return (
    <Button title="Test Feature Button" small primary>
      Test Feature Button
    </Button>
  );
};

interface Props {
  viewModel: HomeViewModel;
}

export const Desktop: FC<Props> = observer(({ viewModel }) => {
  return (
    <Wrapper>
      <BalanceView viewModel={viewModel} />
      {featureFlags.isEnabled(Features.TestFeature) ? <TestFeatureButton /> : null}
      <WalletImg src={walletImg} />
    </Wrapper>
  );
});
