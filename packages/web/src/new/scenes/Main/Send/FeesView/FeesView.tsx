import type { FC } from 'react';

import { ZERO } from '@orca-so/sdk';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';
import type { SendViewModel } from 'new/scenes/Main/Send';
import { Network } from 'new/scenes/Main/Send';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { SendRelayMethodType } from 'new/services/SendService';
import { numberToString, numberToTokenString } from 'new/utils/NumberExtensions';

import { FeeTransactionTooltip } from './FeeTransactionTooltip';
import { FeeView } from './FeeView';

interface Props {
  viewModel: Readonly<SendViewModel>;
  hideAccountCreationFeeSelector?: boolean;
}

export const FeesView: FC<Props> = observer(({ viewModel, hideAccountCreationFeeSelector }) => {
  const receive = expr(() => {
    const amount = viewModel.amount;
    const wallet = viewModel.wallet;

    // use _feeString to render receive line
    return _feeString({
      fee: amount,
      unit: wallet?.token.symbol ?? '',
      price: viewModel.getPrice(wallet?.token.symbol ?? ''),
    });
  });

  const transferFee = expr(() => {
    const feeAmount = viewModel.feeInfo.value?.feeAmount;
    const payingWallet = viewModel.payingWallet;

    if (!feeAmount) {
      return '';
    }

    const prices = viewModel.getPrices([payingWallet?.token.symbol ?? '']);
    return _stringForTransactionFee({
      feeAmount,
      prices,
      symbol: payingWallet?.token.symbol ?? '',
      decimals: payingWallet?.token.decimals,
    });
  });

  const feeHint =
    viewModel.network !== Network.solana ? null : <FeeTransactionTooltip viewModel={viewModel} />;

  const accountCreationFeeIsHidden = expr(() => {
    const network = viewModel.network;
    const feeAmount = viewModel.feeInfo.value?.feeAmount;
    if (!feeAmount) {
      return true;
    }

    if (network !== Network.solana) {
      return true;
    }

    return feeAmount.accountBalances.eq(ZERO);
  });

  const accountCreationFee = expr(() => {
    const network = viewModel.network;
    const payingWallet = viewModel.payingWallet;
    const feeAmount = viewModel.feeInfo.value?.feeAmount;
    if (!feeAmount) {
      return null;
    }

    if (network !== Network.solana) {
      return null;
    }

    return _stringForAccountCreationFee({
      feeAmount,
      price: viewModel.getPrice(payingWallet?.token.symbol ?? ''),
      symbol: payingWallet?.token.symbol ?? '',
      decimals: payingWallet?.token.decimals,
    });
  });

  const otherFeesIsHidden = expr(() => {
    const network = viewModel.network;
    const feeAmount = viewModel.feeInfo.value?.feeAmount;

    if (network !== Network.bitcoin) {
      return true;
    }

    const _otherFees = feeAmount?.others;
    if (!_otherFees) {
      return true;
    }

    return _otherFees.length === 0;
  });

  const otherFees = expr(() => {
    const feeAmount = viewModel.feeInfo.value?.feeAmountInSOL;
    if (!feeAmount) {
      return null;
    }

    const prices = viewModel.getPrices(['SOL', 'renBTC']) ?? {};
    return _stringForOtherFees({
      feeAmount,
      prices,
    });
  });

  const payingFeeTokenIsHidden = expr(() => {
    if (viewModel.relayMethod.type !== SendRelayMethodType.relay) {
      return true;
    }

    const network = viewModel.network;
    if (network !== Network.solana) {
      return true;
    }

    const fee = viewModel.feeInfo.value?.feeAmount;
    if (fee) {
      return fee.total.eqn(0); // only this condition to show
    }

    return true;
  });

  const totalFee = expr(() => {
    const feeAmount = viewModel.feeInfo.value?.feeAmount;
    if (!feeAmount) {
      return null;
    }

    const payingWallet = viewModel.payingWallet;

    return _stringForTotalFee({
      feeAmount,
      price: viewModel.getPrice(payingWallet?.token.symbol ?? ''),
      symbol: payingWallet?.token.symbol ?? '',
      decimals: payingWallet?.token.decimals,
    });
  });

  const totalFeeHeader = expr(() => {
    const feeAmount = viewModel.feeInfo.value?.feeAmount;
    if (!feeAmount) {
      return '';
    }

    const payingWallet = viewModel.payingWallet;
    const decimals = payingWallet?.token.decimals;
    const symbol = payingWallet?.token.symbol ?? '';

    const fee = convertToBalance(feeAmount.total, decimals ?? 0);
    return `${numberToString(fee, { maximumFractionDigits: 9 })} ${symbol}`;
  });

  const tokenPrice = expr(() => {
    const { wallet } = viewModel;

    if (!wallet) {
      return 0;
    }

    const price = viewModel.getPrice(wallet.token.symbol);

    return `${numberToString(price, { maximumFractionDigits: wallet.token.decimals })} ${
      Defaults.fiat.code
    }`;
  });

  const fiatPrice = expr(() => {
    const { wallet } = viewModel;

    if (!wallet) {
      return 0;
    }

    const price = viewModel.getPrice(wallet.token.symbol);
    const resultPrice = price === 0 ? 0 : 1 / price;
    return numberToTokenString(resultPrice, wallet.token);
  });

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Transaction details"
          titleBottomName="Total fee"
          titleBottomValue={totalFeeHeader}
          // titleBottomName={titleBottomNameEl(isAddressNotMatchNetwork)}
          // titleBottomValue={titleBottomValueEl(isAddressNotMatchNetwork, details.totalAmount || '')}
        />
      }
      open
      noContentPadding
    >
      {viewModel.wallet ? (
        <ListWrapper>
          <Row>
            <Text className="gray nowrap">1 {viewModel.wallet?.token.symbol} price</Text>
            <Text className="flex-end right">{tokenPrice}</Text>
          </Row>
          <Row>
            <Text className="gray nowrap">1 {Defaults.fiat.code} price</Text>
            <Text className="flex-end right">{fiatPrice}</Text>
          </Row>
        </ListWrapper>
      ) : null}
      <ListWrapper>
        <Row>
          <Text className="gray">Receive</Text>
          {receive}
        </Row>
        <Row>
          <Text className="gray">Transfer fee</Text>
          <Text className="inline-flex">
            {transferFee} {feeHint}
          </Text>
        </Row>
        {!accountCreationFeeIsHidden ? (
          <Row>
            <Text className="gray">Account creation fee</Text>
            {accountCreationFee}
          </Row>
        ) : null}
        {!otherFeesIsHidden ? otherFees : null}
      </ListWrapper>
      {!payingFeeTokenIsHidden && !hideAccountCreationFeeSelector ? (
        <ListWrapper>
          <FeeView viewModel={viewModel} />
        </ListWrapper>
      ) : null}
      <ListWrapper className="total">
        <Row>
          <Text>Total fee</Text>
          {totalFee}
        </Row>
      </ListWrapper>
    </Accordion>
  );
});

function _stringForTransactionFee({
  feeAmount,
  prices,
  symbol,
  decimals,
}: {
  feeAmount: SolanaSDK.FeeAmount;
  prices: Record<string, number>;
  symbol: string;
  decimals?: number;
}) {
  if (feeAmount.transaction.eqn(0)) {
    return (
      <Text>
        Free <Text className="green inline-flex">(Paid by P2P.org)</Text>
      </Text>
    );
  } else {
    const fee = convertToBalance(feeAmount.transaction, decimals ?? 0);
    return _feeString({ fee, unit: symbol, price: prices[symbol] });
  }
}

function _stringForAccountCreationFee({
  feeAmount,
  price,
  symbol,
  decimals,
}: {
  feeAmount: SolanaSDK.FeeAmount;
  price: number;
  symbol: string;
  decimals?: number;
}) {
  if (feeAmount.accountBalances.lten(0)) {
    return null;
  }

  const fee = convertToBalance(feeAmount.accountBalances, decimals ?? 0);
  return _feeString({ fee, unit: symbol, price });
}

function _stringForOtherFees({
  feeAmount,
  prices,
}: {
  feeAmount: SolanaSDK.FeeAmount;
  prices: Record<string, number>;
}) {
  const others = feeAmount.others;
  if (!others || others.length === 0) {
    return null;
  }

  return others.map((fee, index) => (
    <Row key={index}>
      {_feeString({
        fee: fee.amount,
        unit: fee.unit,
        price: prices[fee.unit],
      })}
    </Row>
  ));
}

function _stringForTotalFee({
  feeAmount,
  price,
  symbol,
  decimals,
}: {
  feeAmount: SolanaSDK.FeeAmount;
  price: number;
  symbol: string;
  decimals?: number;
}) {
  if (feeAmount.total.eqn(0)) {
    return <Text>{Defaults.fiat.symbol}0</Text>;
  }

  const fee = convertToBalance(feeAmount.total, decimals ?? 0);
  return _feeString({
    fee,
    unit: symbol,
    price,
  });
}

function _feeString({ fee, unit, price = 0 }: { fee: number; unit: string; price?: number }) {
  const feeInFiat = fee * price;
  return (
    <Text className="right">
      <Text>
        {numberToString(fee, { maximumFractionDigits: 9 })} {unit}
      </Text>{' '}
      <Text className="gray">
        (~{Defaults.fiat.symbol}
        {numberToString(feeInFiat, { maximumFractionDigits: 2 })})
      </Text>
    </Text>
  );
}
