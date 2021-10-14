import React, { FC, useMemo } from 'react';
import { useAsync } from 'react-async-hook';

import { styled } from '@linaria/react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import { useSolana } from 'app/contexts/solana';
import { stepOneStates, useConfig, usePrice, useSwap } from 'app/contexts/swap';
import { formatBigNumber, formatNumberToUSD } from 'app/contexts/swap/utils/format';
import { LoaderBlock } from 'components/common/LoaderBlock';

import { Label, Line, Value } from './common/styled';
import { FeesAccordion } from './FeesAccordion';

// TODO: is it right?
const ATA_ACCOUNT_CREATION_FEE = 0.00203928;

// const Small = styled.div`
//   color: #b9bbcd;
//   font-size: 14px;
// `;

const LoaderBlockStyled = styled(LoaderBlock)`
  height: 24px;
`;

export const FeesOriginal: FC = () => {
  const { wallet, connection } = useSolana();
  const { programIds, tokenConfigs } = useConfig();
  const { trade, intermediateTokenName, asyncStandardTokenAccounts, buttonState } = useSwap();
  const { useAsyncMergedPrices } = usePrice();
  const asyncPrices = useAsyncMergedPrices();

  const tokenNames = useMemo(() => {
    if (!asyncStandardTokenAccounts) {
      return [];
    }

    return trade.getTokenNamesToSetup(asyncStandardTokenAccounts);
  }, [trade, asyncStandardTokenAccounts]);

  const feePools = useMemo(() => {
    if (!intermediateTokenName) {
      return [
        [
          formatBigNumber(trade.getFees()[0], tokenConfigs[trade.outputTokenName].decimals),
          trade.outputTokenName,
        ],
      ];
    } else if (trade.derivedFields?.doubleHopFields) {
      const fees = trade.getFees();
      return [
        [
          formatBigNumber(fees[0], tokenConfigs[intermediateTokenName].decimals, 3),
          intermediateTokenName,
        ],
        [
          formatBigNumber(fees[1], tokenConfigs[trade.outputTokenName].decimals, 3),
          trade.outputTokenName,
        ],
      ];
    } else {
      return [];
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

  const transactionFee = useAsync(async () => {
    const { feeCalculator } = await connection.getRecentBlockhash();

    let signedTransaction;
    if (stepOneStates.includes(buttonState)) {
      ({ signedTransaction } = await trade.confirmSetup(
        connection,
        tokenConfigs,
        programIds,
        wallet,
        tokenNames,
      ));
    } else {
      const inputUserTokenPublicKey = asyncStandardTokenAccounts?.[trade.inputTokenName];
      const intermediateTokenPublicKey = intermediateTokenName
        ? asyncStandardTokenAccounts?.[intermediateTokenName]
        : undefined;
      const outputUserTokenAccount = asyncStandardTokenAccounts?.[trade.outputTokenName];

      ({ signedTransaction } = await trade.confirmExchange(
        connection,
        tokenConfigs,
        programIds,
        wallet,
        inputUserTokenPublicKey?.account,
        intermediateTokenPublicKey?.account,
        outputUserTokenAccount?.account,
      ));
    }

    return (
      (signedTransaction.signatures.length * feeCalculator.lamportsPerSignature) / LAMPORTS_PER_SOL
    );
  }, [connection, buttonState, tokenNames, programIds, tokenConfigs, trade, wallet]);

  const totalFee = useAsync(async () => {
    let totalFeeUSD = 0;
    const priceSOL = asyncPrices.value?.['SOL'];

    const accountsCreationFeeSOL = tokenNames.length * ATA_ACCOUNT_CREATION_FEE;

    const feePoolsFeeUSD = feePools.reduce((sum, fee) => {
      const amount = fee[0];
      const tokenName = fee[1];
      const price = asyncPrices.value?.[tokenName];

      if (price) {
        sum += Number(amount) * price;
      }

      return sum;
    }, 0);
    totalFeeUSD += feePoolsFeeUSD;

    if (priceSOL) {
      const accountsCreationFeeUSD = accountsCreationFeeSOL * priceSOL;
      const transactionFeeUSD = (transactionFee.result || 0) * priceSOL;
      totalFeeUSD += accountsCreationFeeUSD + transactionFeeUSD;
    }

    return formatNumberToUSD(totalFeeUSD);
  }, [tokenNames, transactionFee.result, feePools, asyncPrices.value]);

  return (
    <FeesAccordion totalFee={totalFee}>
      {tokenNames.map((tokenName) => (
        <Line key={tokenName}>
          <Label>{tokenName} Account creation</Label>
          <Value>{ATA_ACCOUNT_CREATION_FEE} SOL</Value>
        </Line>
      ))}
      <Line>
        <Label>Liquidity provider fees</Label>
        <Value>
          <div>{feePools.map((fee) => fee.join(' ')).join(' + ')}</div>
          {/*<Small>{feePercentages}</Small>*/}
        </Value>
      </Line>
      <Line>
        <Label>Transaction fee</Label>
        <Value>
          {transactionFee.loading ? (
            <LoaderBlockStyled size="16" />
          ) : (
            `${transactionFee.result} SOL`
          )}
        </Value>
      </Line>
      <Line className="topBorder">
        <Label>Total fee</Label>
        <Value>{totalFee.loading ? <LoaderBlockStyled size="16" /> : totalFee.result}</Value>
      </Line>
    </FeesAccordion>
  );
};
