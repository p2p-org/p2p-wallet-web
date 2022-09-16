import type { FC, ReactNode } from 'react';
import { useCallback } from 'react';
import { generatePath, useHistory, useParams } from 'react-router';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';
import * as R from 'ramda';

import { Icon } from 'components/ui';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';
import { LoadableStateType } from 'new/app/models/LoadableRelay';
import type { PayingFee } from 'new/app/models/PayingFee';
import { FeesView } from 'new/scenes/Main/Swap/Subviews/FeesView';
import type { SwapViewModel } from 'new/scenes/Main/Swap/Swap/Swap.ViewModel';
import type { SwapRouteParams } from 'new/scenes/Main/Swap/Swap/types';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { numberToString } from 'new/utils/NumberExtensions';

const PenIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  margin: auto 0;

  color: ${theme.colors.textIcon.secondary};

  cursor: pointer;
`;

interface Props {
  viewModel: Readonly<SwapViewModel>;
}

export const DetailFeesView: FC<Props> = observer(({ viewModel }) => {
  const history = useHistory();
  const { symbol } = useParams<SwapRouteParams>();

  const handleShowSettings = useCallback(() => {
    history.push(generatePath('/swap/settings/:symbol?', { symbol }));
  }, [history, symbol]);

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
            (~${Defaults.fiat.symbol}$
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
      <Text key={index} className="right">
        Free {payBy ? <Text className="green inline-flex">({payBy})</Text> : null}
        {/*{fee.info ? <FeeTransactionTooltip viewModel={viewModel} /> : null}*/}
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
            <Row>
              <Text className="gray">Max price slippage</Text>
              <Text>
                {viewModel.slippage * 100}% <PenIcon name="pen" onClick={handleShowSettings} />
              </Text>
            </Row>

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

          <ListWrapper className="flat">
            <FeesView items={viewModel.swapSettingsViewModel.feesContent} flat />
          </ListWrapper>

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
