import type { FC } from 'react';
import { useMemo } from 'react';

import { styled } from '@linaria/react';
import { ZERO } from '@orca-so/sdk';
import { theme, useIsMobile } from '@p2p-wallet-web/ui';
import { u64 } from '@solana/spl-token';
import classNames from 'classnames';
import Decimal from 'decimal.js';

import type { UseSwap } from 'app/contexts';
import { useNetworkFees } from 'app/contexts';
import { useConfig } from 'app/contexts/solana/swap';
import { formatBigNumber } from 'app/contexts/solana/swap/utils/format';
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

const TOKEN_AMOUNT_SIGNIFICANT_DIGITS = 6;
const ONE_TOKEN_BASE = 10;

export interface FeesOriginalProps {
  swapInfo: UseSwap;
  open?: boolean;
  forPage?: boolean;
}

export const FeesOriginal: FC<FeesOriginalProps> = ({ swapInfo, forPage, open }) => {
  const { tokenConfigs } = useConfig();
  const { trade, intermediateTokenName } = swapInfo;
  const isMobile = useIsMobile();
  const { accountRentExemption } = useNetworkFees();

  /*const {
    settings: { useFreeTransactions },
  } = useSettings();*/

  const { handleShowSettings } = useShowSettings();

  const outputDecimals = tokenConfigs[swapInfo.trade.outputTokenName]?.decimals || 0;
  const minReceiveAmount = formatBigNumber(swapInfo.trade.getMinimumOutputAmount(), outputDecimals);
  const depositFee = formatBigNumber(accountRentExemption, tokenConfigs['SOL']?.decimals || 0);
  const showDepositFee =
    trade.inputTokenName === 'SOL' ||
    trade.outputTokenName === 'SOL' ||
    intermediateTokenName === 'SOL';

  /*
  useEffect(() => {
    if (trade && trade.pools && !Object.values(trade.pools).length) {
      return;
    }

    console.log('trade.pools -', trade.pools);
    trade.pools &&
      Object.entries(trade.pools).forEach(([name, pool]) => {
        console.log(
          `fees ${name} -`,
          pool.calculateFees(trade.getInputAmount(), trade.inputTokenName).toString(),
        );
      });
  }, [trade.pools]);
*/

  /*const tokenNames = useMemo(() => {
    if (!asyncStandardTokenAccounts) {
      return [];
    }

    return trade.getTokenNamesToSetup(asyncStandardTokenAccounts);
  }, [trade, asyncStandardTokenAccounts]);*/

  const totalAmount = useMemo(() => {
    return `${formatBigNumber(
      trade.getInputAmount(),
      tokenConfigs[trade.inputTokenName].decimals,
    )} ${trade.inputTokenName}`;
  }, [tokenConfigs, trade]);

  const getTokenPrice = (isReverse: boolean) => {
    const one = new Decimal(1);

    return formatNumber(
      (isReverse ? one.div(trade.getExchangeRate()) : trade.getExchangeRate())
        .toSignificantDigits(TOKEN_AMOUNT_SIGNIFICANT_DIGITS)
        .toString(),
    );
  };

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

  /*const elCompensationFee =
    forPage &&
    (trade.inputTokenName !== 'SOL' ? (
      <ListWrapper className="flat">
        <CompensationFee type="swap" isShow={true} />
      </ListWrapper>
    ) : undefined);*/

  const elTotal = forPage && (
    <ListWrapper className="total">
      <Row>
        <Text>Total</Text>
        <Text>{totalAmount}</Text>
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

  const liquidityFeeEl = useMemo(() => {
    let fee1Formated = null;

    const [fee0, fee1] = trade.derivedFields?.fees as u64[];

    const fee0Formated =
      formatBigNumber(fee0, tokenConfigs[trade.inputTokenName]?.decimals) +
      ' ' +
      trade.inputTokenName;

    if (trade.derivedFields?.doubleHopFields) {
      fee1Formated =
        formatBigNumber(fee1, tokenConfigs[trade.outputTokenName]?.decimals) +
        ' ' +
        trade.outputTokenName;
    }

    const showFee1 = fee1 && !fee1.eq(ZERO);

    return (
      <Row>
        <Text className="gray">Liquidity provider fee</Text>
        <Text className={classNames({ grid: true })}>
          <span>
            {fee0Formated}
            {showFee1 ? <span style={{ marginLeft: 5 }}>+</span> : null}
          </span>
          {showFee1 ? <span>{fee1Formated}</span> : null}
        </Text>
      </Row>
    );
  }, [trade.derivedFields, trade.inputTokenName, trade.outputTokenName, tokenConfigs]);

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Swap details"
          titleBottomName="Total amount spent"
          titleBottomValue={totalAmount || ''}
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
        {showDepositFee ? (
          <Row>
            <Text className="gray">Deposit (will be returned)</Text>
            <Text className={classNames({ grid: isMobile })}>
              {depositFee} SOL
              <Text className="flex-end">
                <AmountUSDStyled
                  prefix="(~"
                  postfix=")"
                  amount={accountRentExemption}
                  tokenName="SOL"
                />
              </Text>
            </Text>
          </Row>
        ) : null}
        {liquidityFeeEl}
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
        {/*tokenNames?.map((tokenName) => (
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
        ))*/}
      </ListWrapper>
      {/*elCompensationFee*/}
      {elTotal}
    </Accordion>
  );
};

FeesOriginal.defaultProps = defaultProps;
