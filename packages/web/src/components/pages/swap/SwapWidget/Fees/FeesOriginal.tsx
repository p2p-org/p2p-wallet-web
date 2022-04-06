import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { useAsync } from 'react-async-hook';

import { styled } from '@linaria/react';
import type { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { useTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import { up } from '@p2p-wallet-web/ui';
import type { useSolana } from '@saberhq/use-solana';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import type {
  useFeeCompensation,
  useFreeFeeLimits,
  useNetworkFees,
  UsePrice,
  UseSwap,
} from 'app/contexts';
import { useConfig } from 'app/contexts/solana/swap';
import { formatBigNumber, formatNumberToUSD } from 'app/contexts/solana/swap/utils/format';
import { CompensationFee } from 'components/common/CompensationFee';
import { FeeToolTip } from 'components/common/TransactionDetails/FeeNewTooltip';
import { AmountUSD } from 'components/pages/swap/SwapWidget/AmountUSD';
import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

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

const defaultProps = {
  open: true,
  forPage: false,
};

const FeesWrapper = styled.div`
  margin-top: 16px;

  ${up.tablet} {
    margin-top: 0;
  }
`;

const AmountUSDStyled = styled(AmountUSD)`
  &::before {
    content: '(';
  }

  &::after {
    content: ')';
  }

  margin-left: 8px;

  color: #8e8e93;
`;

const ATA_ACCOUNT_CREATION_FEE = 0.00203928;
const FEE_SIGNIFICANT_DIGITS = 1;

export const FeesOriginal: FC<FeesOriginalProps> = (props) => {
  const { wallet, connection } = props.solanaProvider;
  const { programIds, tokenConfigs } = useConfig();
  const { trade, intermediateTokenName, asyncStandardTokenAccounts } = props.swapInfo;
  const { useAsyncMergedPrices } = props.priceInfo;
  const userTokenAccounts = props.userTokenAccounts;
  const asyncPrices = useAsyncMergedPrices();
  const { setFromToken, setAccountsCount, compensationState, feeToken, feeAmountInToken } =
    props.feeCompensationInfo;
  const { userFreeFeeLimits } = props.feeLimitsInfo;

  const [solTokenAccount] = useMemo(
    () => userTokenAccounts.filter((token) => token.balance?.token.isRawSOL),
    [userTokenAccounts],
  );
  const inputUserTokenAccount = useMemo(() => {
    return asyncStandardTokenAccounts?.[trade.inputTokenName];
  }, [asyncStandardTokenAccounts, trade.inputTokenName]);

  const fromTokenAccount = useTokenAccount(usePubkey(inputUserTokenAccount?.account));

  const publicKey = wallet?.publicKey;
  const outputDecimals = tokenConfigs[props.swapInfo.trade.outputTokenName]?.decimals || 0;
  const minReceiveAmount = formatBigNumber(
    props.swapInfo.trade.getMinimumOutputAmount(),
    outputDecimals,
  );

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

  const elCompensationFee =
    props.forPage &&
    (!fromTokenAccount?.balance?.token.isRawSOL ? (
      <CompensationFee type="swap" isShow={trade.inputTokenName !== 'SOL'} />
    ) : undefined);

  const elTotal = props.forPage && (
    <ListWrapper className="total">
      <Row>
        <Text>Total</Text>
        <Text>{details.totlalAmount}</Text>
      </Row>
    </ListWrapper>
  );

  const accountCreationFee = formatBigNumber(
    props.networkFees.accountRentExemption,
    tokenConfigs['SOL'].decimals,
    FEE_SIGNIFICANT_DIGITS,
  );

  return (
    <FeesWrapper>
      <Accordion
        title={
          <AccordionTitle
            title="Swap details"
            titleBottomName="Total amount spent"
            titleBottomValue={details.totlalAmount || ''}
          />
        }
        open={props.open}
        noContentPadding
      >
        <ListWrapper>
          <Row>
            <Text className="gray">Receive at least</Text>
            <Text>
              {minReceiveAmount} {props.swapInfo.trade.outputTokenName}
              <AmountUSDStyled
                prefix={'~'}
                amount={props.swapInfo.trade.getMinimumOutputAmount()}
                tokenName={props.swapInfo.trade.outputTokenName}
              />
            </Text>
          </Row>
          <Row>
            <Text className="gray">Transaction fee</Text>
            <Text>
              Free{' '}
              <Text className="green inline-flex">
                (Paid by P2P.org) <FeeToolTip userFreeFeeLimits={userFreeFeeLimits} />
              </Text>
            </Text>
          </Row>
          {Boolean(tokenNames.length) &&
            tokenNames.map((tokenName) => (
              <Row>
                <Text className="gray">{tokenName} account creation</Text>
                <Text>
                  {accountCreationFee} SOL
                  <AmountUSDStyled
                    prefix={'~'}
                    amount={props.networkFees.accountRentExemption}
                    tokenName={'SOL'}
                  />
                </Text>
              </Row>
            ))}
          {elCompensationFee}
        </ListWrapper>
        {elTotal}
      </Accordion>
    </FeesWrapper>
  );
};

FeesOriginal.defaultProps = defaultProps;
