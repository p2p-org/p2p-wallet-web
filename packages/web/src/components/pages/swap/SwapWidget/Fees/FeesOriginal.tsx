import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { useAsync } from 'react-async-hook';

import { styled } from '@linaria/react';
import { useSolana, useTokenAccount, useUserTokenAccounts } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import { useFeeCompensation, useFreeFeeLimits } from 'app/contexts';
import { useConfig, usePrice, useSwap } from 'app/contexts/solana/swap';
import { formatBigNumber, formatNumberToUSD } from 'app/contexts/solana/swap/utils/format';
import { CompensationFee } from 'components/common/CompensationFee';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { FreeTransactionTooltip } from 'components/common/TransactionDetails/FreeTransactionTooltip';
import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

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
  const { trade, intermediateTokenName, asyncStandardTokenAccounts } = useSwap();
  const { useAsyncMergedPrices } = usePrice();
  const userTokenAccounts = useUserTokenAccounts();
  const asyncPrices = useAsyncMergedPrices();
  const { setFromToken, setAccountsCount, compensationState, feeToken, feeAmountInToken } =
    useFeeCompensation();
  const { userFreeFeeLimits } = useFreeFeeLimits();

  const [solTokenAccount] = useMemo(
    () => userTokenAccounts.filter((token) => token.balance?.token.isRawSOL),
    [userTokenAccounts],
  );
  const inputUserTokenAccount = useMemo(() => {
    return asyncStandardTokenAccounts?.[trade.inputTokenName];
  }, [asyncStandardTokenAccounts, trade.inputTokenName]);

  const fromTokenAccount = useTokenAccount(usePubkey(inputUserTokenAccount?.account));

  const publicKey = wallet?.publicKey;

  useEffect(() => {
    if (fromTokenAccount?.balance) {
      setFromToken(fromTokenAccount);
    } else {
      setFromToken(solTokenAccount);
    }
  }, [fromTokenAccount, setFromToken, trade]);

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
    if (!publicKey) {
      return {
        setupFee: 0,
        swapFee: 0,
      };
    }

    const { feeCalculator } = await connection.getRecentBlockhash();

    const inputUserTokenPublicKey = asyncStandardTokenAccounts?.[trade.inputTokenName];
    const intermediateTokenPublicKey = intermediateTokenName
      ? asyncStandardTokenAccounts?.[intermediateTokenName]
      : undefined;
    const outputUserTokenAccount = asyncStandardTokenAccounts?.[trade.outputTokenName];

    // const { setupTransaction, swapTransaction } = await trade.prepareExchangeTransactions(
    //   connection,
    //   tokenConfigs,
    //   programIds,
    //   publicKey,
    //   inputUserTokenPublicKey?.account,
    //   intermediateTokenPublicKey?.account,
    //   outputUserTokenAccount?.account,
    // );

    const { userSwapArgs, setupSwapArgs } = await trade.prepareExchangeTransactionsArgs(
      connection,
      tokenConfigs,
      programIds,
      publicKey,
      inputUserTokenPublicKey?.account,
      intermediateTokenPublicKey?.account,
      outputUserTokenAccount?.account,
    );

    let setupFee;
    // if (setupTransaction) {
    //   setupFee =
    //     (setupTransaction.signatures.length * feeCalculator.lamportsPerSignature) /
    //     LAMPORTS_PER_SOL;
    // }
    let newAccountCount = 0;
    if (setupSwapArgs) {
      newAccountCount += 1;
      setupFee = (1 * feeCalculator.lamportsPerSignature) / LAMPORTS_PER_SOL;
    }

    if (userSwapArgs?.exchangeData?.wsolAccountParams) {
      newAccountCount += 1;
    }

    setAccountsCount(newAccountCount);
    // const swapFee =
    //   (swapTransaction.signatures.length * feeCalculator.lamportsPerSignature) / LAMPORTS_PER_SOL;

    const swapFee = 0;

    return { setupFee, swapFee };
  }, [connection, tokenNames, programIds, tokenConfigs, trade, wallet]);

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

      let transactionSetupFeeUSD = 0;
      if (transactionFee.result?.setupFee) {
        transactionSetupFeeUSD = transactionFee.result.setupFee * priceSOL;
      }

      let transactionSwapFeeUSD = 0;
      if (transactionFee.result?.swapFee) {
        transactionSwapFeeUSD = transactionFee.result.swapFee * priceSOL;
      }

      totalFeeUSD += accountsCreationFeeUSD + transactionSetupFeeUSD + transactionSwapFeeUSD;
    }

    return formatNumberToUSD(totalFeeUSD);
  }, [tokenNames, transactionFee.result, feePools, asyncPrices.value]);

  const renderTransactionFee = () => {
    if (transactionFee.loading) {
      return <LoaderBlockStyled size="16" />;
    }

    if (transactionFee.result) {
      return (
        <>
          {transactionFee.result.setupFee &&
            `${transactionFee.result.setupFee} SOL (Create token accounts) + `}
          {transactionFee.result.swapFee && `${transactionFee.result.swapFee} SOL (Swap)`}
        </>
      );
    }

    return "Can't calculate";
  };

  const details = useMemo(() => {
    let receiveAmount;

    if (trade.getOutputAmount()) {
      receiveAmount = `${formatBigNumber(
        trade.getOutputAmount(),
        tokenConfigs[trade.outputTokenName].decimals,
      )} ${trade.outputTokenName}`;
    }

    const fromAmount = `${formatBigNumber(
      trade.getInputAmount(),
      tokenConfigs[trade.inputTokenName].decimals,
    )} ${trade.inputTokenName}`;

    let totlalAmount = fromAmount;
    let fees;

    if (feeToken?.balance?.token.isRawSOL) {
      fees = `${formatBigNumber(
        compensationState.estimatedFee.accountRent,
        tokenConfigs['SOL'].decimals,
      )} SOL`;
      totlalAmount += ` + ${fees}`;
    }
    if (compensationState.needTopUp && !feeToken?.balance?.token.isRawSOL) {
      if (feeToken && feeToken.balance) {
        fees = `${formatBigNumber(
          trade.getInputAmount().add(feeAmountInToken),
          tokenConfigs[trade.inputTokenName].decimals,
        )} ${trade.inputTokenName}`;

        totlalAmount = fees;
      }
    }

    return {
      receiveAmount,
      fees,
      totlalAmount,
    };
  }, [compensationState, feeAmountInToken, feeToken, tokenConfigs, trade]);

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Transaction details"
          titleBottomName="Total"
          titleBottomValue={details.totlalAmount || ''}
        />
      }
      open
      noContentPadding
    >
      <ListWrapper>
        <Row>
          <Text className="gray">Receive at least</Text>
          <Text>
            {details.receiveAmount}
            {/* <Text className="gray">(~$150)</Text> */}
          </Text>
        </Row>
        <Row>
          <Text className="gray">Transaction fee</Text>
          <Text>
            Free{' '}
            <Text className="green inline-flex">
              (Paid by P2P.org){' '}
              <FreeTransactionTooltip
                freeTransactionCount={userFreeFeeLimits.maxTransactionCount}
                currentTransactionCount={userFreeFeeLimits.currentTransactionCount}
              />
            </Text>
          </Text>
        </Row>
        {details.accountCreationAmount && false ? (
          <Row>
            <Text className="gray">USDC account creation</Text>
            <Text>
              {details.accountCreationAmount}
              {/* <Text className="gray">(~$0.5)</Text> */}
            </Text>
          </Row>
        ) : undefined}
        {!fromTokenAccount?.balance?.token.isRawSOL ? (
          <CompensationFee type="swap" isShow={trade.inputTokenName !== 'SOL'} />
        ) : undefined}
      </ListWrapper>
      <ListWrapper className="total">
        <Row>
          <Text>Total</Text>
          <Text>
            {details.totlalAmount}
            {/* <Text className="gray">(~$150.5)</Text> */}
          </Text>
        </Row>
      </ListWrapper>
    </Accordion>
  );
};
