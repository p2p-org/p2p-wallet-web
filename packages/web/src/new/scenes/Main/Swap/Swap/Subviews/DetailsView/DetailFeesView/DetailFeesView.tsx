import type { FC, ReactNode } from 'react';

import { observer } from 'mobx-react-lite';
import * as R from 'ramda';

import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';
import type { LoadableRelay } from 'new/app/models/LoadableRelay';
import { LoadableStateType } from 'new/app/models/LoadableRelay';
import type { PayingFee } from 'new/app/models/PayingFee';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { numberToString } from 'new/utils/NumberExtensions';

import { FeeTransactionTooltip } from './FeeTransactionTooltip';

interface DetailFeesViewVieModelType {
  readonly fees: LoadableRelay<PayingFee[]>;
  getPrice(symbol: string): number | null;
  readonly totalFees: {
    totalFeesSymbol: string;
    decimals: number;
    amount: number;
    amountInFiat: number;
  } | null;
}

interface Props {
  viewModel: Readonly<DetailFeesViewVieModelType>;
  slippageView?: ReactNode;
  feesView?: ReactNode;
}

export const DetailFeesView: FC<Props> = observer(({ viewModel, slippageView, feesView }) => {
  const formatAmount = ({ fee, withFiat }: { fee: PayingFee; withFiat: boolean }) => {
    const amount = convertToBalance(fee.lamports, fee.token.decimals);
    const price = viewModel.getPrice(fee.token.symbol) ?? 0;
    const amountInFiat = amount * price;

    return (
      <Text>
        {numberToString(amount, { maximumFractionDigits: fee.token.decimals + 1 })}{' '}
        {fee.token.symbol}
        {withFiat ? (
          <Text className="gray">
            (~{Defaults.fiat.symbol}
            {numberToString(amountInFiat, {
              maximumFractionDigits: 2,
            })}
            )
          </Text>
        ) : null}
      </Text>
    );
  };

  const formatTotalFees = () => {
    const totalFees = viewModel.totalFees;
    if (totalFees) {
      const { totalFeesSymbol, decimals, amount, amountInFiat } = totalFees;

      return (
        <Text>
          <Text className="big">
            {numberToString(amount, { maximumFractionDigits: decimals })} {totalFeesSymbol}
          </Text>{' '}
          <Text className="gray">
            (~{Defaults.fiat.symbol}
            {numberToString(amountInFiat, { maximumFractionDigits: 2 })})
          </Text>
        </Text>
      );
    }
  };

  const customRow = ({ title, trailing }: { title: string; trailing: ReactNode }) => {
    return (
      <Row key={title}>
        <Text className="gray">{title}</Text>
        {trailing}
      </Row>
    );
  };

  const freeFee = ({ fee, index }: { fee: PayingFee; index: number }) => {
    const payBy = fee.info?.payBy;
    return (
      <Text key={index} className="inline-flex">
        <Text className="right">
          Free {payBy ? <Text className="green">({payBy})</Text> : null}
        </Text>
        {fee.info ? <FeeTransactionTooltip info={fee.info} /> : null}
      </Text>
    );
  };

  const row = ({ title, descriptions }: { title: string; descriptions: ReactNode[] }) => {
    return (
      <Row key={title}>
        <Text className="gray">{title}</Text>
        <Text className="right">
          {descriptions.map((description, index) => {
            if (index === 0) {
              return <span key={index}>{description}</span>;
            } else {
              return <span key={index}> + {description}</span>;
            }
          })}
        </Text>
      </Row>
    );
  };

  const snapshot = viewModel.fees;
  switch (snapshot.state.type) {
    case LoadableStateType.loaded: {
      const value = snapshot.value ?? [];
      const group = R.pipe(
        R.groupBy<PayingFee, string>((el) => el.type.headerString),
        R.mapObjIndexed(
          R.sort<PayingFee>((el1, el2) => {
            const id1 =
              value.findIndex((fee) => fee.type.headerString === el1.type.headerString) ?? 0;
            const id2 =
              value.findIndex((fee) => fee.type.headerString === el2.type.headerString) ?? 0;
            return id1 - id2;
          }),
        ),
      )(value);

      return (
        <>
          <ListWrapper>
            {/* Slippage */}
            {slippageView ? slippageView : null}

            {/* Fee categories*/}
            {Object.entries(group).map((el) => {
              if (el[1].some((fee) => fee.isFree)) {
                // Free fee
                return customRow({
                  title: el[0],
                  trailing: el[1].map((fee, index) => freeFee({ fee, index })),
                });
              } else {
                // Normal fee
                return row({
                  title: el[0],
                  descriptions: el[1].map((fee) =>
                    formatAmount({
                      fee,
                      withFiat: value.length === 1,
                    }),
                  ),
                });
              }
            })}
          </ListWrapper>

          {feesView ? <ListWrapper className="flat">{feesView}</ListWrapper> : null}

          {/* Total */}
          <ListWrapper className="total">
            <Row>
              <Text>Total fee</Text>
              {formatTotalFees()}
            </Row>
          </ListWrapper>
        </>
      );
    }
    default:
      return null;
  }
});
