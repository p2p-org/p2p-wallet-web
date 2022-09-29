import type { FC } from 'react';

import { styled } from '@linaria/react';
import { ZERO } from '@orca-so/sdk';
import { borders, theme } from '@p2p-wallet-web/ui';
import { u64 } from '@solana/spl-token';
import { observer } from 'mobx-react-lite';

import { Loader } from 'components/common/Loader';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import { numberToString } from 'new/utils/NumberExtensions';

import type { ReceiveBitcoinViewModel } from '../ReceiveBitcoin.ViewModel';

const Wrapper = styled.div`
  padding: 16px;

  color: ${theme.colors.textIcon.primary};
  font-size: 14px;
  line-height: 160%;
  letter-spacing: 0.01em;

  background: ${theme.colors.bg.app};
  border-radius: 12px;
  ${borders.primaryRGBA}
`;

const List = styled.ul`
  display: grid;
  grid-gap: 16px;
  margin: 0;
  padding-left: 20px;
`;

const Row = styled.li`
  list-style: disc;
`;

const MinimumTxAmount = styled.div`
  display: inline-flex;
`;

interface Props {
  viewModel: ReceiveBitcoinViewModel;
}

export const Hint: FC<Props> = observer(({ viewModel }) => {
  return (
    <Wrapper>
      <List>
        <Row>
          This address accepts <strong>only Bitcoin</strong>. You may lose assets by sending another
          coin.
        </Row>
        <Row>
          <MinimumTxAmount>
            Minimum transaction amount of&nbsp;
            {viewModel.isFetchingFee ? (
              <Loader />
            ) : (
              <>
                <strong>{`${numberToString(
                  convertToBalance(viewModel.fee?.mul(new u64(2)) ?? ZERO, 8),
                  { maximumFractionDigits: 8 },
                )} BTC`}</strong>
                .
              </>
            )}
          </MinimumTxAmount>
        </Row>
        <Row>
          <strong>{viewModel.remainingTime}</strong> is the remaining time to safely send the
          assets.
        </Row>
      </List>
    </Wrapper>
  );
});
