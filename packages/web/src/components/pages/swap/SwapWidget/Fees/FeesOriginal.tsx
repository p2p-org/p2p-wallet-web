import type { FC } from 'react';
import { useEffect, useMemo } from 'react';

import { styled } from '@linaria/react';
import type { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { useTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import { theme, useIsMobile } from '@p2p-wallet-web/ui';
import { u64 } from '@solana/spl-token';
import classNames from 'classnames';
import Decimal from 'decimal.js';

import type { useFeeCompensation, useNetworkFees, UseSwap } from 'app/contexts';
import { useConfig } from 'app/contexts/solana/swap';
import { formatBigNumber } from 'app/contexts/solana/swap/utils/format';
import { CompensationFee } from 'components/common/CompensationFee';
import { Accordion, Icon } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';
import { formatNumber } from 'utils/format';

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

const FEE_SIGNIFICANT_DIGITS = 1;
const TOKEN_AMOUNT_SIGNIFICANT_DIGITS = 6;
const ONE_TOKEN_BASE = 10;

export interface FeesOriginalProps {
  userTokenAccounts: ReturnType<typeof useUserTokenAccounts>;
  feeCompensationInfo: ReturnType<typeof useFeeCompensation>;
  networkFees: ReturnType<typeof useNetworkFees>;
  swapInfo: UseSwap;
  open?: boolean;
  forPage?: boolean;
}

export const FeesOriginal: FC<FeesOriginalProps> = ({
  swapInfo,
  networkFees,
  userTokenAccounts,
  feeCompensationInfo,
  forPage,
  open,
}) => {
  const { tokenConfigs } = useConfig();
  const { trade, asyncStandardTokenAccounts } = swapInfo;
  const { setFromToken, compensationState, feeToken, feeAmountInToken } = feeCompensationInfo;
  const isMobile = useIsMobile();

  /*const {
    settings: { useFreeTransactions },
  } = useSettings();*/

  const { handleShowSettings } = useShowSettings();

  const [solTokenAccount] = useMemo(
    () => userTokenAccounts.filter((token) => token.balance?.token.isRawSOL),
    [userTokenAccounts],
  );
  const inputUserTokenAccount = useMemo(() => {
    return asyncStandardTokenAccounts?.[trade.inputTokenName];
  }, [asyncStandardTokenAccounts, trade.inputTokenName]);

  const fromTokenAccount = useTokenAccount(usePubkey(inputUserTokenAccount?.account));

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

  const elSlippage = forPage && (
    <Row>
      <Text className="gray">Max price slippage</Text>
      <Text>
        {trade.slippageTolerance.toString()}%{' '}
        {forPage ? <PenIcon name="pen" onClick={handleShowSettings}></PenIcon> : undefined}
      </Text>
    </Row>
  );

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

  const elTokenPrices = forPage && (
    <ListWrapper>
      <Row>
        <Text className="gray">1 {trade.inputTokenName} price</Text>
        <Text className={classNames({ grid: isMobile })}>
          {getTokenPrice(false)} {trade.outputTokenName}
          <Text className="flex-end">
            <AmountUSDStyled
              prefix="(~"
              postfix=")"
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
              prefix="(~"
              postfix=")"
              amount={outputTokenPrice}
              tokenName={trade.outputTokenName}
            />
          </Text>
        </Text>
      </Row>
    </ListWrapper>
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
      open={open}
      noContentPadding
    >
      {elTokenPrices}
      <ListWrapper>
        {elSlippage}
        <Row>
          <Text className="gray">Receive at least</Text>
          <Text className={classNames({ grid: isMobile })}>
            {minReceiveAmount} {swapInfo.trade.outputTokenName}
            <Text className="flex-end">
              <AmountUSDStyled
                prefix="(~"
                postfix=")"
                amount={swapInfo.trade.getMinimumOutputAmount()}
                tokenName={swapInfo.trade.outputTokenName}
              />
            </Text>
          </Text>
        </Row>
        <Row>
          <Text className="gray">Transaction fee</Text>
          {/*useFreeTransactions ? (
            <Text>
              Free{' '}
              <Text className="green inline-flex">
                (Paid by P2P.org) <FeeTransactionTooltip userFreeFeeLimits={userFreeFeeLimits} />
              </Text>
            </Text>
          ) : (
            <Text>1</Text>
          )*/}
          <Text>5000 lamport</Text>
        </Row>
        {tokenNames?.map((tokenName) => (
          <Row key={tokenName}>
            <Text className="gray">{tokenName} account creation</Text>
            <Text className={classNames({ grid: isMobile })}>
              {accountCreationFee} SOL
              <Text className="flex-end">
                <AmountUSDStyled
                  prefix="(~"
                  postfix=")"
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
