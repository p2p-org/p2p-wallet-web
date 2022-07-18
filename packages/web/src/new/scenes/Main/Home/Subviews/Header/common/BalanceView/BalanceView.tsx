import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import type { HomeViewModel } from 'new/scenes/Main/Home';
import { Defaults } from 'new/services/Defaults';

const Wrapper = styled.div``;

const BalanceWrapper = styled.div`
  display: grid;
  grid-gap: 4px;

  text-align: center;

  ${up.tablet} {
    text-align: left;
  }
`;

const Title = styled.div`
  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.01em;
  white-space: nowrap;

  ${up.tablet} {
    color: ${theme.colors.textIcon.primary};
  }
`;

const Strong = styled.span`
  color: ${theme.colors.textIcon.primary};
  font-weight: bold;
`;

const Balance = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: bold;
  font-size: 28px;
  line-height: 140%;
  letter-spacing: 0.01em;
  font-feature-settings: 'tnum' on, 'lnum' on;
`;

interface Props {
  viewModel: HomeViewModel;
}

export const BalanceView: FC<Props> = observer(({ viewModel }) => {
  const domain = Defaults.apiEndPoint.network === 'mainnet-beta' ? '.p2p.sol' : '.p2p';

  return (
    <Wrapper>
      <BalanceWrapper>
        <Title>
          {viewModel.username ? (
            <>
              <Strong>{viewModel.username}</Strong>
              {domain}
            </>
          ) : (
            'Balance'
          )}
        </Title>
        <Balance>
          {viewModel.isBalanceLoading ? <Skeleton width={100} height={30} /> : viewModel.balance}
        </Balance>
      </BalanceWrapper>
    </Wrapper>
  );
});
