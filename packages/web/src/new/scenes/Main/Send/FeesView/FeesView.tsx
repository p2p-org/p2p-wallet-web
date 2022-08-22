import type { FC } from 'react';

import { ZERO } from '@orca-so/sdk';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';
import type { SendViewModelType } from 'new/scenes/Main/Send';
import { Network } from 'new/scenes/Main/Send';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';

import { FeeTransactionTooltip } from './FeeTransactionTooltip';

interface Props {
  viewModel: Readonly<SendViewModelType>;
}

export const FeesView: FC<Props> = observer(({ viewModel }) => {
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

    console.log(
      77777777,
      payingWallet?.token.symbol ?? '',
      viewModel.getPrice(payingWallet?.token.symbol ?? ''),
    );

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

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Transaction details"
          titleBottomName="Total"
          titleBottomValue="value"
          // titleBottomName={titleBottomNameEl(isAddressNotMatchNetwork)}
          // titleBottomValue={titleBottomValueEl(isAddressNotMatchNetwork, details.totalAmount || '')}
        />
      }
      open
      noContentPadding
    >
      <ListWrapper>
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

        {/*<Row>*/}
        {/*  <Text className="gray">Receive</Text>*/}
        {/*  <Text>*/}
        {/*    receiveAmount*/}
        {/*    /!* <Text className="gray">(~$150)</Text> *!/*/}
        {/*  </Text>*/}
        {/*</Row>*/}
        {/*<Row>
          <Text className="gray">Transaction fee</Text>
          {useFreeTransactions ? (
            <Text>
              Free{' '}
              <Text className="green inline-flex">
                (Paid by P2P.org) <FeeTransactionTooltip userFreeFeeLimits={userFreeFeeLimits} />
              </Text>
            </Text>
          ) : (
            <Text>1</Text>
          )}
          <Text>5000 lamport</Text>
        </Row>*/}
        {/*details.accountCreationAmount ? (
          <Row>
            <Text className="gray">{destinationAccount?.symbol} account creation</Text>
            <Text>
              {details.accountCreationAmount}
            </Text>
          </Row>
        ) : undefined*/}
        {/*!fromTokenAccount?.balance?.token.isRawSOL ? (
          <CompensationFee
            type="send"
            isShow={!fromTokenAccount?.balance?.token.isRawSOL}
            accountSymbol={destinationAccount?.symbol || ''}
          />
        ) : undefined*/}
      </ListWrapper>
      <ListWrapper className="total">
        <Row>
          <Text>Total</Text>
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
    <Text>
      <Text>
        {fee.toFixed(9)} {unit}
      </Text>{' '}
      <Text className="gray">
        (~{Defaults.fiat.symbol}
        {feeInFiat.toFixed(2)})
      </Text>
    </Text>
  );
}
