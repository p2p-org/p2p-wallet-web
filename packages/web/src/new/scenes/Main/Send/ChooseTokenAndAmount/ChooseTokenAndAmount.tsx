import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { Icon } from 'components/ui';
import { InputAmount } from 'components/ui/InputAmount';
import type { SendViewModel } from 'new/scenes/Main/Send';
import { WalletSelectorContent } from 'new/scenes/Main/Send/ChooseTokenAndAmount/WalletSelectorContent';
import { trackEvent } from 'new/sdk/Analytics';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { AmountTypeButton } from 'new/ui/components/common/AmountTypeButton';
import { ChooseWallet } from 'new/ui/components/common/ChooseWallet';
import { numberToString } from 'new/utils/NumberExtensions';

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

const BottomWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
`;

interface Props {
  viewModel: Readonly<SendViewModel>;
}

export const ChooseTokenAndAmount: FC<Props> = observer(({ viewModel }) => {
  const vm = viewModel.chooseTokenAndAmountViewModel;

  // available amount
  const balanceText = expr(() => {
    const wallet = vm.wallet;
    const mode = vm.currencyMode;
    if (!wallet) {
      return null;
    }

    const amount = vm.calculateAvailableAmount;
    if (!amount) {
      return null;
    }

    if (mode === CurrencyMode.fiat) {
      return `${numberToString(amount, { maximumFractionDigits: 2 })} ${Defaults.fiat.code}`;
    }

    return `${numberToString(amount, { maximumFractionDigits: 9 })} ${wallet.token.symbol}`;
  });

  const equityValueLabel = expr(() => {
    const amount = viewModel.amount;
    const wallet = vm.wallet;
    const currencyMode = vm.currencyMode;
    if (!wallet) {
      return '';
    }

    let equityValue = amount * wallet.priceInCurrentFiat;
    let equityValueSymbol = Defaults.fiat.code;
    let maximumFractionDigits = 2;
    if (currencyMode === CurrencyMode.fiat) {
      if (wallet.priceInCurrentFiat > 0) {
        equityValue = amount / wallet.priceInCurrentFiat;
      } else {
        equityValue = 0;
      }
      equityValueSymbol = wallet.token.symbol;
      maximumFractionDigits = wallet.token.decimals;
    }

    return `${equityValueSymbol} ${numberToString(equityValue, { maximumFractionDigits })}`;
  });

  const handleUseAllBalanceClick = () => {
    const availableAmount = vm.calculateAvailableAmount;
    const string = numberToString(availableAmount ?? 0, {
      maximumFractionDigits: 9,
      groupingSeparator: '',
    });
    viewModel.enterAmount(Number(string));
    viewModel.setMaxWasClicked();
  };

  const handleWalletChange = (wallet: Wallet) => {
    viewModel.chooseWallet(wallet);
  };

  const handleToggleCurrencyModeClick = () => {
    vm.toggleCurrencyMode();

    trackEvent({
      name: 'Send_USD_Button',
      params: { Mode: vm.currencyMode === CurrencyMode.fiat ? 'Fiat' : 'Token' },
    });
  };

  const handleAmountChange = (value: string) => {
    viewModel.enterAmount(Number(value));
  };

  // error
  const balanceClassName = expr(() => {
    const error = vm.error;
    const amount = vm.amount;

    let className = '';
    if (vm.error && amount !== 0) {
      className = 'error';
    } else if (!error && amount === vm.calculateAvailableAmount) {
      className = 'success';
    }
    return className;
  });

  const isAmountEqualMaxBalance = expr(() => vm.amount === vm.calculateAvailableAmount);

  return (
    <Wrapper>
      <TopWrapper>
        <Title>From</Title>
        <BalanceText>
          <AllBalance
            className={classNames({ [balanceClassName]: true })}
            onClick={handleUseAllBalanceClick}
          >
            <WalletBalanceIcon name="wallet" />
            {balanceText}
            {!isAmountEqualMaxBalance ? <Max>MAX</Max> : null}
          </AllBalance>
        </BalanceText>
      </TopWrapper>
      <MainWrapper>
        <ChooseWallet
          viewModel={vm.chooseWalletViewModel}
          customFilter={(wallet) => wallet.amount > 0}
          selector={<WalletSelectorContent viewModel={vm.chooseWalletViewModel} />}
          selectedWallet={viewModel.wallet}
          showOtherWallets={false}
          onWalletChange={handleWalletChange}
        />
        <InputWrapper>
          <InputAmount
            placeholder={numberToString(0, {
              maximumFractionDigits: vm.wallet?.token.decimals ?? 0,
            })}
            value={viewModel.amount === 0 ? undefined : viewModel.amount}
            decimals={viewModel.wallet?.token.decimals}
            onChange={handleAmountChange}
          />
        </InputWrapper>
      </MainWrapper>
      {vm.wallet?.priceInCurrentFiat ? (
        <BottomWrapper>
          <AmountTypeButton title={equityValueLabel} onClick={handleToggleCurrencyModeClick} />
        </BottomWrapper>
      ) : null}
    </Wrapper>
  );
});
