import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { InputAmount } from 'components/ui/InputAmount';
import { WalletSelectorContent } from 'new/scenes/Main/Send/ChooseTokenAndAmount/WalletSelectorContent';
import type { SwapViewModel } from 'new/scenes/Main/Swap/Swap/Swap.ViewModel';
import { ActiveInputField } from 'new/scenes/Main/Swap/Swap/types';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { ChooseWallet } from 'new/ui/components/common/ChooseWallet';
import { numberToString } from 'new/utils/NumberExtensions';

import { BalanceView } from './BalanceView';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: 16px 20px;

  &:first-child {
    padding-bottom: 32px;

    ${up.tablet} {
      padding-bottom: 16px;
    }
  }
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

const MainWrapper = styled.div`
  position: relative;

  display: grid;
  grid-template-columns: min-content 1fr;
`;

const InputWrapper = styled.div`
  display: flex;
`;

interface Props {
  type: 'source' | 'destination';
  viewModel: Readonly<SwapViewModel>;
}

export const WalletView: FC<Props> = observer(({ type, viewModel }) => {
  const chooseWalletViewModel = expr(() => {
    if (type === 'source') {
      return viewModel.chooseSourceWalletViewModel;
    } else {
      return viewModel.chooseDestinationWalletViewModel;
    }
  });

  const wallet = expr(() => {
    if (type === 'source') {
      return viewModel.sourceWallet;
    } else {
      return viewModel.destinationWallet;
    }
  });

  const customFilterFactory = () => {
    if (type === 'source') {
      return (wallet: Wallet) => wallet.amount > 0;
    } else {
      // if destination
      let destinationMints: string[] = [];
      const sourceWallet = viewModel.sourceWallet;
      if (sourceWallet) {
        let validMints: string[] = [];
        try {
          validMints = viewModel.swapService.findPosibleDestinationMints(
            sourceWallet.token.address,
          );
        } catch {
          // ignore
        }
        if (validMints.length !== 0) {
          destinationMints = validMints;
        }
      }

      const validMints = new Set(destinationMints);
      const excludedSourceWalletPubkey = sourceWallet?.pubkey;
      return (wallet: Wallet) =>
        wallet.pubkey !== excludedSourceWalletPubkey && validMints.has(wallet.mintAddress);
    }
  };

  const showOtherWallets = expr(() => {
    if (type === 'source') {
      return false;
    }
    return true;
  });

  const placeholder = expr(() => {
    return numberToString(0, { maximumFractionDigits: wallet?.token.decimals ?? 0 });
  });

  const handleWalletChange = (wallet: Wallet) => {
    const isSelectingSourceWallet = type === 'source';
    viewModel.walletDidSelect(wallet, isSelectingSourceWallet);
  };

  const amount = expr(() => {
    if (type === 'source') {
      return viewModel.inputAmount ?? undefined;
    } else {
      return viewModel.estimatedAmount ?? undefined;
    }
  });

  const handleAmountChange = (value: string) => {
    const valueNew = Number(value);
    if (type === 'source') {
      viewModel.enterInputAmount(valueNew);
    } else {
      viewModel.enterEstimatedAmount(valueNew);
    }
  };

  const handleFocus = () => {
    viewModel.setActiveInputField(
      type === 'source' ? ActiveInputField.source : ActiveInputField.destination,
    );
  };

  const handleBlur = () => {
    viewModel.setActiveInputField(ActiveInputField.none);
  };

  return (
    <Wrapper>
      <TopWrapper>
        <Title>{type === 'source' ? 'From' : 'To'}</Title>
        <BalanceView type={type} viewModel={viewModel} />
      </TopWrapper>
      <MainWrapper>
        <ChooseWallet
          viewModel={chooseWalletViewModel}
          selector={<WalletSelectorContent viewModel={chooseWalletViewModel} />}
          selectedWallet={wallet}
          customFilter={customFilterFactory()}
          showOtherWallets={showOtherWallets}
          onWalletChange={handleWalletChange}
        />
        <InputWrapper>
          <InputAmount
            placeholder={placeholder}
            value={amount}
            decimals={wallet?.token.decimals}
            onChange={handleAmountChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </InputWrapper>
      </MainWrapper>
    </Wrapper>
  );
});
