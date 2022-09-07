import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { Icon } from 'components/ui';
import type { SwapViewModel } from 'new/scenes/Main/Swap/Swap/Swap.ViewModel';
import { numberToString } from 'new/utils/NumberExtensions';

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;

  cursor: pointer;

  &.disabled {
    cursor: auto;

    pointer-events: none;
  }
`;

const Max = styled.div`
  margin-left: 8px;

  color: ${theme.colors.textIcon.active};
  text-transform: uppercase;
`;

const WalletBalanceIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  margin-right: 4px;
`;

interface Props {
  type: 'source' | 'destination';
  viewModel: Readonly<SwapViewModel>;
}

export const BalanceView: FC<Props> = observer(({ type, viewModel }) => {
  // available amount
  const balanceText = expr(() => {
    if (type === 'source') {
      const wallet = viewModel.sourceWallet;
      return numberToString(wallet?.amount ?? 0, { maximumFractionDigits: 9 });
    }

    const wallet = viewModel.destinationWallet;
    return wallet?.amount ? numberToString(wallet.amount, { maximumFractionDigits: 9 }) : null;
  });

  const maxButtonIsHidden = expr(() => {
    if (type === 'source') {
      return false;
    }
    return true;
  });

  const useAllBalance = () => {
    // TODO:  amountTextField.resignFirstResponder()
    viewModel.useAllBalance();
  };

  return (
    <Wrapper>
      {balanceText ? <WalletBalanceIcon name="wallet" /> : null}
      {balanceText}
      {maxButtonIsHidden ? null : <Max onClick={useAllBalance}>MAX</Max>}
    </Wrapper>
  );
});
