import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { computed } from 'mobx';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import type { SendViewModel } from 'new/scenes/Main/Send';
import { ChooseWallet } from 'new/scenes/Main/Send/ChooseTokenAndAmount/ChooseWallet';
import { Defaults } from 'new/services/Defaults';

import { CurrencyMode } from './ChooseTokenAndAmount.ViewModel';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: 16px 20px;

  border: 1px solid ${theme.colors.stroke.secondary};
  border-radius: 12px;
`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  margin-bottom: 8px;
`;

const Title = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const BalanceText = styled.div`
  display: flex;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const AllBalance = styled.div`
  display: flex;
  align-items: center;

  cursor: pointer;

  &.disabled {
    cursor: auto;

    pointer-events: none;
  }

  &.error {
    color: ${theme.colors.system.errorMain};
  }

  &.success {
    color: ${theme.colors.system.successMain};
  }
`;

const WalletBalanceIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  margin-right: 4px;
`;

const Max = styled.div`
  margin-left: 8px;

  color: ${theme.colors.textIcon.active};
  text-transform: uppercase;
`;

const MainWrapper = styled.div`
  position: relative;

  display: grid;
  grid-template-columns: min-content 1fr;
`;

const InputWrapper = styled.div`
  display: flex;
`;

interface Props {
  viewModel: Readonly<SendViewModel>;
}

export const ChooseTokenAndAmount: FC<Props> = observer(({ viewModel }) => {
  const vm = viewModel.chooseTokenAndAmountViewModel;

  // available amount
  const balanceText = computed(() => {
    const wallet = vm.wallet;
    const mode = vm.currencyMode;
    const amount = vm.calculateAvailableAmount();
    if (!wallet || !amount) {
      return null;
    }

    let string = amount.toString() + ' ';
    string += mode === CurrencyMode.fiat ? Defaults.fiat.code : wallet.token.symbol;
    return string;
  }).get();

  const useAllBalance = () => {
    const availableAmount = vm.calculateAvailableAmount();
    const string = availableAmount?.toExact();
  };

  return (
    <Wrapper>
      <TopWrapper>
        <Title>From</Title>
        <BalanceText>
          {/*{tokenAccount ? (*/}
          {/*  <AllBalance*/}
          {/*    className={classNames({*/}
          {/*      disabled,*/}
          {/*      error: !hasBalance,*/}
          {/*      success: Number(amount) && hasBalance,*/}
          {/*    })}*/}
          {/*  >*/}
          {/*    <WalletBalanceIcon name="wallet" />*/}
          {/*    {balanceText}*/}
          {/*    {!isAmountEqualMaxBalance ? (*/}
          {/*      <Max onClick={handleAllBalanceClick}>MAX</Max>*/}
          {/*    ) : undefined}*/}
          {/*  </AllBalance>*/}
          {/*) : undefined}*/}
        </BalanceText>
      </TopWrapper>
      <MainWrapper>
        <ChooseWallet viewModel={vm.chooseWalletViewModel} />
        <InputWrapper> {balanceText}</InputWrapper>
      </MainWrapper>
    </Wrapper>
  );
});
