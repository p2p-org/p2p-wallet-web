import React, { FC, useMemo } from 'react';

import { styled } from '@linaria/react';

import { useConfig, useSwap } from 'app/contexts/swap';
import { formatBigNumber } from 'app/contexts/swap/utils/format';

import { Label, Line, Value } from './common/styled';

const Wrapper = styled.div``;

// const Small = styled.div`
//   color: #b9bbcd;
//   font-size: 14px;
// `;

export const FeesOriginal: FC = () => {
  const { trade, intermediateTokenName } = useSwap();
  const { tokenConfigs } = useConfig();

  const feeSymbols = useMemo(() => {
    if (!intermediateTokenName) {
      return (
        formatBigNumber(trade.getFees()[0], tokenConfigs[trade.outputTokenName].decimals) +
        ' ' +
        trade.outputTokenName
      );
    } else if (trade.derivedFields?.doubleHopFields) {
      const fees = trade.getFees();
      return (
        formatBigNumber(fees[0], tokenConfigs[intermediateTokenName].decimals, 3) +
        ' ' +
        intermediateTokenName +
        ' + ' +
        formatBigNumber(fees[1], tokenConfigs[trade.outputTokenName].decimals, 3) +
        ' ' +
        trade.outputTokenName
      );
    } else {
      return null;
    }
  }, [intermediateTokenName, tokenConfigs, trade]);

  // const feePercentages = useMemo(() => {
  //   const pool1 = trade.getPoolFromSelectedRoute(0);
  //   const pool2 = trade.getPoolFromSelectedRoute(1);
  //   if (!intermediateTokenName && pool1) {
  //     if (outputTokenPrice) {
  //       return (
  //         pool1.getFeePercentage() +
  //         '% (' +
  //         formatNumberToUSD(
  //           getUSDValue(
  //             trade.getFees()[0],
  //             tokenConfigs[trade.outputTokenName].decimals,
  //             outputTokenPrice,
  //           ),
  //         ) +
  //         ')'
  //       );
  //     } else {
  //       return pool1.getFeePercentage() + '%';
  //     }
  //   } else if (intermediateTokenName && intermediateTokenPrice && pool1 && pool2) {
  //     const fees = trade.getFees();
  //     const totalFeePercentage = pool1.getFeePercentage() + pool2.getFeePercentage();
  //     if (intermediateTokenPrice && outputTokenPrice) {
  //       return (
  //         totalFeePercentage +
  //         '% (' +
  //         formatNumberToUSD(
  //           getUSDValue(
  //             fees[0],
  //             tokenConfigs[intermediateTokenName].decimals,
  //             intermediateTokenPrice,
  //           ) +
  //             getUSDValue(fees[1], tokenConfigs[trade.outputTokenName].decimals, outputTokenPrice),
  //         ) +
  //         `) - ${pool1.getFeePercentage()}% + ${pool2.getFeePercentage()}%`
  //       );
  //     } else {
  //       return totalFeePercentage + '%';
  //     }
  //   } else {
  //     return null;
  //   }
  // }, [intermediateTokenName, intermediateTokenPrice, outputTokenPrice, tokenConfigs, trade]);

  return (
    <Wrapper>
      <Line>
        <Label>Liquidity provider fees</Label>
        <Value>
          <div>{feeSymbols}</div>
          {/*<Small>{feePercentages}</Small>*/}
        </Value>
      </Line>
    </Wrapper>
  );
};
