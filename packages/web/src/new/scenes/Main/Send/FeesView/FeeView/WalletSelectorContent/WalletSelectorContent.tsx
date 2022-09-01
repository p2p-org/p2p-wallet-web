import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import { LoadableStateType } from 'new/app/models/LoadableRelay';
import type { FeeInfo, SendViewModel } from 'new/scenes/Main/Send';
import type { Wallet } from 'new/sdk/SolanaSDK';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';
import { numberToString } from 'new/utils/NumberExtensions';

const Wrapper = styled.div`
  display: flex;
  width: 100%;
`;

const TokenAvatarStyled = styled(TokenAvatar)`
  margin-right: 12px;
`;

const IconWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: ${theme.colors.system.errorBg};
  border-radius: 12px;
`;

const RoundStopIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.system.errorMain};
`;

const Fees = styled.div`
  flex-grow: 1;
`;

const Top = styled.div``;

const Bottom = styled.div``;

const Label = styled.span`
  margin-right: 4px;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;

  &.alert {
    color: ${theme.colors.system.errorMain};
  }
`;

interface Props {
  viewModel: Readonly<SendViewModel>;
}

export const WalletSelectorContent: FC<Props> = observer(({ viewModel }) => {
  const solPrice = viewModel.getPrice('SOL');
  const payingWallet = viewModel.payingWallet;
  const feeInfo = viewModel.feeInfo;

  return (
    <Wrapper>
      {!payingWallet && feeInfo.value?.hasAvailableWalletToPayFee ? null : !feeInfo.value
          ?.hasAvailableWalletToPayFee ? (
        <IconWrapper>
          <RoundStopIcon name="round-stop" />
        </IconWrapper>
      ) : (
        <TokenAvatarStyled token={payingWallet?.token} size={44} />
      )}
      <Fees>
        {payingWallet ? (
          <Top>{feeAmountToString({ feeAmount: feeInfo.value?.feeAmountInSOL, solPrice })}</Top>
        ) : null}
        <Bottom>
          {payingWalletToString({
            state: feeInfo.state.type,
            value: feeInfo.value,
            payingWallet,
          })}
        </Bottom>
      </Fees>
    </Wrapper>
  );
});

function feeAmountToString({
  feeAmount,
  solPrice,
}: {
  feeAmount?: SolanaSDK.FeeAmount;
  solPrice?: number;
}) {
  if (!feeAmount) {
    return null;
  }

  const titles: string[] = [];
  if (feeAmount.accountBalances.gtn(0)) {
    titles.push('Account creation fee');
  }

  if (feeAmount.transaction.gtn(0)) {
    titles.push('Transaction fee');
  }

  const title = titles.join(' + ');
  let amount = convertToBalance(feeAmount.total, 9);
  let amountString = `${numberToString(amount, {
    maximumFractionDigits: 9,
    autoSetMaximumFractionDigits: true,
  })} SOL`;
  if (solPrice) {
    amount *= solPrice;
    amountString = `~${Defaults.fiat.symbol} ${numberToString(amount, {
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <Label>
      {title} {amountString}
    </Label>
  );
}

function payingWalletToString({
  state,
  value,
  payingWallet,
}: {
  state: LoadableStateType;
  value: FeeInfo | null;
  payingWallet: Wallet | null;
}) {
  if (!payingWallet) {
    return <Label>Choose the token to pay fees</Label>;
  }

  switch (state) {
    case LoadableStateType.notRequested:
      return <Label>Choose the token to pay fees</Label>;
    case LoadableStateType.loading:
      return <Label>Calculating fees</Label>;
    case LoadableStateType.loaded: {
      if (!value) {
        return <Label>Could not calculating fees</Label>;
      }

      if (!value.hasAvailableWalletToPayFee) {
        return <Label className="alert">Not enough funds</Label>;
      }

      return (
        <Label>
          {numberToString(convertToBalance(value.feeAmount.total, payingWallet.token.decimals), {
            maximumFractionDigits: 9,
            autoSetMaximumFractionDigits: true,
          })}{' '}
          {payingWallet.token.symbol}
        </Label>
      );
    }
    case LoadableStateType.error:
      return <Label className="alert">Could not calculating fees</Label>;
  }
}
