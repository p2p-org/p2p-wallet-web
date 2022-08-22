import type { FC } from 'react';

import { styled } from '@linaria/react';
import { ZERO } from '@orca-so/sdk';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import type { SendViewModelType } from 'new/scenes/Main/Send';

const Wrapper = styled.div`
  padding: 16px 20px;

  color: ${theme.colors.textIcon.primary};
  font-size: 14px;
  line-height: 160%;
  letter-spacing: 0.01em;

  background: ${theme.colors.system.warningBg};
  border: 0.5px solid ${theme.colors.system.warningMain};
  border-radius: 0 0 12px 12px;
`;

interface Props {
  viewModel: Readonly<SendViewModelType>;
}

// attentionLabel
export const AttentionView: FC<Props> = observer(({ viewModel }) => {
  const attentionIsHidden = expr(() => {
    const feeInfo = viewModel.feeInfo;
    return (feeInfo.value?.feeAmountInSOL?.accountBalances ?? ZERO).eq(ZERO);
  });

  if (attentionIsHidden) {
    return null;
  }

  const symbol = viewModel.wallet?.token.symbol ?? '';

  return (
    <Wrapper>
      This address does not appear to have a {symbol} account. You have to pay a one-time fee to
      create a {symbol} account for this address. You can choose which currency to pay in below.
    </Wrapper>
  );
});
