import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { useAsync } from 'react-async-hook';

import { styled } from '@linaria/react';
import type { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { useTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import { theme, useIsMobile } from '@p2p-wallet-web/ui';
import type { useSolana } from '@saberhq/use-solana';
import { u64 } from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import classNames from 'classnames';
import Decimal from 'decimal.js';

import type {
  useFeeCompensation,
  useFreeFeeLimits,
  useNetworkFees,
  UsePrice,
  UseSwap,
} from 'app/contexts';
import { useConfig } from 'app/contexts/solana/swap';
import { formatBigNumber } from 'app/contexts/solana/swap/utils/format';
import { CompensationFee } from 'components/common/CompensationFee';
import { FeeTransactionTooltip } from 'components/common/TransactionDetails/FeeTransactinTooltip';
import { Accordion, Icon } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';
import { formatNumber, getNumberFromFormattedNumber } from 'components/utils/format';

import { useShowSettings } from '../../hooks/useShowSettings';
import { AmountUSDStyled } from '../AmountUSD';

const defaultProps = {
  open: true,
  forPage: false,
};

const PenIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  margin: auto 0;

  color: ${theme.colors.textIcon.secondary};

  cursor: pointer;
`;

const ATA_ACCOUNT_CREATION_FEE = 0.00203928;
const FEE_SIGNIFICANT_DIGITS = 1;
const POOL_SIGNIFICANT_DIGITS = 3;
const TOKEN_AMOUNT_SIGNIFICANT_DIGITS = 6;
const ONE_TOKEN_BASE = 10;

export interface FeesOriginalProps {
  userTokenAccounts: ReturnType<typeof useUserTokenAccounts>;
  feeCompensationInfo: ReturnType<typeof useFeeCompensation>;
  feeLimitsInfo: ReturnType<typeof useFreeFeeLimits>;
  solanaProvider: ReturnType<typeof useSolana>;
  networkFees: ReturnType<typeof useNetworkFees>;
  priceInfo: UsePrice;
  swapInfo: UseSwap;
  open?: boolean;
  forPage?: boolean;
}

export const FeesOriginal: FC<FeesOriginalProps> = ({
  feeLimitsInfo,
  swapInfo,
  networkFees,
  solanaProvider,
  userTokenAccounts,
  priceInfo,
  feeCompensationInfo,
  forPage,
}) => {
  const { wallet, connection } = solanaProvider;
  const { programIds, tokenConfigs } = useConfig();
  const { trade, intermediateTokenName, asyncStandardTokenAccounts } = swapInfo;
  const { useAsyncMergedPrices } = priceInfo;
  const asyncPrices = useAsyncMergedPrices();
  const { setFromToken, setAccountsCount, compensationState, feeToken, feeAmountInToken } =
    feeCompensationInfo;
  const { userFreeFeeLimits } = feeLimitsInfo;
  const isMobile = useIsMobile();

  const { handleShowSettings } = useShowSettings();

  const [solTokenAccount] = useMemo(
    () => userTokenAccounts.filter((token) => token.balance?.token.isRawSOL),
    [userTokenAccounts],
  );
  const inputUserTokenAccount = useMemo(() => {
    return asyncStandardTokenAccounts?.[trade.inputTokenName];
  }, [asyncStandardTokenAccounts, trade.inputTokenName]);

  const fromTokenAccount = useTokenAccount(usePubkey(inputUserTokenAccount?.account));

  const publicKey = wallet?.publicKey;
  const outputDecimals = tokenConfigs[swapInfo.trade.outputTokenName]?.decimals || 0;
  const minReceiveAmount = formatBigNumber(swapInfo.trade.getMinimumOutputAmount(), outputDecimals);

  useEffect(() => {
    if (fromTokenAccount?.balance) {
      setFromToken(fromTokenAccount);
    } else {
      setFromToken(solTokenAccount);
    }
  }, [fromTokenAccount, setFromToken, solTokenAccount]);

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
          formatBigNumber(
            fees[0],
            tokenConfigs[intermediateTokenName].decimals,
            POOL_SIGNIFICANT_DIGITS,
          ),
          intermediateTokenName,
        ],
        [
          formatBigNumber(
            fees[1],
            tokenConfigs[trade.outputTokenName].decimals,
            POOL_SIGNIFICANT_DIGITS,
          ),
          trade.outputTokenName,
        ],
      ];
    } else {
      return [];
    }
  }, [intermediateTokenName, tokenConfigs, trade]);

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

    let newAccountCount = 0;
    if (setupSwapArgs) {
      newAccountCount += 1;
      setupFee = (1 * feeCalculator.lamportsPerSignature) / LAMPORTS_PER_SOL;
    }

    if (userSwapArgs?.exchangeData?.wsolAccountParams) {
      newAccountCount += 1;
    }

    setAccountsCount(newAccountCount);

    const swapFee = 0;

    return { setupFee, swapFee };
  }, [connection, tokenNames, programIds, tokenConfigs, trade, wallet]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  const totalFee = useAsync(async () => {
    let totalFeeUSD = 0;
    const priceSOL = asyncPrices.value?.['SOL'];

    const accountsCreationFeeSOL = tokenNames.length * ATA_ACCOUNT_CREATION_FEE;

    const feePoolsFeeUSD = feePools.reduce((sum, fee) => {
      const amount = fee[0];
      const tokenName = fee[1];
      const price = asyncPrices.value?.[tokenName];

      if (price) {
        sum += getNumberFromFormattedNumber(amount) * price;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  /*
  const renderTransactionFee = () => {
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
  */

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
      const feesAndFromAmount = trade
        .getInputAmount()
        .add(compensationState.estimatedFee.accountRent);
      totlalAmount = `${formatBigNumber(feesAndFromAmount, tokenConfigs['SOL'].decimals)} SOL`;
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

  const getTokenPrice = (isReverse: boolean) => {
    const one = new Decimal(1);

    return formatNumber(
      (isReverse ? one.div(trade.getExchangeRate()) : trade.getExchangeRate())
        .toSignificantDigits(TOKEN_AMOUNT_SIGNIFICANT_DIGITS)
        .toString(),
    );
  };

  const elCompensationFee =
    forPage &&
    (trade.inputTokenName !== 'SOL' ? (
      <ListWrapper className="flat">
        <CompensationFee type="swap" isShow={true} />
      </ListWrapper>
    ) : undefined);

  const elTotal = forPage && (
    <ListWrapper className="total">
      <Row>
        <Text>Total</Text>
        <Text>{details.totlalAmount}</Text>
      </Row>
    </ListWrapper>
  );

  const accountCreationFee = formatBigNumber(
    networkFees.accountRentExemption,
    tokenConfigs['SOL'].decimals,
    FEE_SIGNIFICANT_DIGITS,
  );

  const inputTokenPrice = new u64(
    Math.pow(ONE_TOKEN_BASE, tokenConfigs[trade.inputTokenName]?.decimals as number),
  );

  const outputTokenPrice = new u64(
    Math.pow(ONE_TOKEN_BASE, tokenConfigs[trade.outputTokenName]?.decimals as number),
  );

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Swap details"
          titleBottomName="Total amount spent"
          titleBottomValue={details.totlalAmount || ''}
        />
      }
      open
      noContentPadding
    >
      <ListWrapper>
        <Row>
          <Text className="gray">1 {trade.inputTokenName} price</Text>
          <Text className={classNames({ grid: isMobile })}>
            {getTokenPrice(false)} {trade.outputTokenName}
            <Text className="flex-end">
              <AmountUSDStyled
                prefix={'~'}
                amount={inputTokenPrice}
                tokenName={trade.inputTokenName}
              />
            </Text>
          </Text>
        </Row>
        <Row>
          <Text className="gray">1 {trade.outputTokenName} price</Text>
          <Text className={classNames({ grid: isMobile })}>
            {getTokenPrice(true)} {trade.inputTokenName}
            <Text className="flex-end">
              <AmountUSDStyled
                prefix={'~'}
                amount={outputTokenPrice}
                tokenName={trade.outputTokenName}
              />
            </Text>
          </Text>
        </Row>
      </ListWrapper>
      <ListWrapper>
        <Row>
          <Text className="gray">Max price slippage</Text>
          <Text>
            {trade.slippageTolerance.toString()}%{' '}
            {forPage ? <PenIcon name="pen" onClick={handleShowSettings}></PenIcon> : undefined}
          </Text>
        </Row>
        <Row>
          <Text className="gray">Receive at least</Text>
          <Text className={classNames({ grid: isMobile })}>
            {minReceiveAmount} {swapInfo.trade.outputTokenName}
            <Text className="flex-end">
              <AmountUSDStyled
                prefix={'~'}
                amount={swapInfo.trade.getMinimumOutputAmount()}
                tokenName={swapInfo.trade.outputTokenName}
              />
            </Text>
          </Text>
        </Row>
        <Row>
          <Text className="gray">Transaction fee</Text>
          <Text>
            Free{' '}
            <Text className="green inline-flex">
              (Paid by P2P.org) <FeeTransactionTooltip userFreeFeeLimits={userFreeFeeLimits} />
            </Text>
          </Text>
        </Row>
        {tokenNames?.map((tokenName) => (
          <Row key={tokenName}>
            <Text className="gray">{tokenName} account creation</Text>
            <Text className={classNames({ grid: isMobile })}>
              {accountCreationFee} SOL
              <Text className="flex-end">
                <AmountUSDStyled
                  prefix={'~'}
                  amount={networkFees.accountRentExemption}
                  tokenName={'SOL'}
                />
              </Text>
            </Text>
          </Row>
        ))}
      </ListWrapper>
      {elCompensationFee}
      {elTotal}
    </Accordion>
  );
};

FeesOriginal.defaultProps = defaultProps;
