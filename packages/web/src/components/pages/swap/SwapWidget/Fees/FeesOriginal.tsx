import type { FC } from 'react';
import { useEffect, useMemo } from 'react';

import type { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { useTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';

import type { useFeeCompensation, useFreeFeeLimits, UseSwap } from 'app/contexts';
import { useConfig } from 'app/contexts/solana/swap';
import { formatBigNumber } from 'app/contexts/solana/swap/utils/format';
import { CompensationFee } from 'components/common/CompensationFee';
import { FeeToolTip } from 'components/common/TransactionDetails/FeeNewTooltip';
import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

export interface FeesOriginalProps {
  swapInfo: UseSwap;
  userTokenAccounts: ReturnType<typeof useUserTokenAccounts>;
  feeCompensationInfo: ReturnType<typeof useFeeCompensation>;
  feeLimitsInfo: ReturnType<typeof useFreeFeeLimits>;
  open?: boolean;
  forPage?: boolean;
}

const defaultProps = {
  open: true,
  forPage: false,
};

export const FeesOriginal: FC<FeesOriginalProps> = (props) => {
  const { tokenConfigs } = useConfig();
  const { trade, asyncStandardTokenAccounts } = props.swapInfo;
  const userTokenAccounts = props.userTokenAccounts;
  const { setFromToken, compensationState, feeToken, feeAmountInToken } = props.feeCompensationInfo;
  const { userFreeFeeLimits } = props.feeLimitsInfo;

  const [solTokenAccount] = useMemo(
    () => userTokenAccounts.filter((token) => token.balance?.token.isRawSOL),
    [userTokenAccounts],
  );
  const inputUserTokenAccount = useMemo(() => {
    return asyncStandardTokenAccounts?.[trade.inputTokenName];
  }, [asyncStandardTokenAccounts, trade.inputTokenName]);

  const fromTokenAccount = useTokenAccount(usePubkey(inputUserTokenAccount?.account));

  useEffect(() => {
    if (fromTokenAccount?.balance) {
      setFromToken(fromTokenAccount);
    } else {
      setFromToken(solTokenAccount);
    }
  }, [fromTokenAccount, setFromToken, trade]);

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

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Swap details"
          titleBottomName="Total"
          titleBottomValue={details.totlalAmount || ''}
        />
      }
      open={props.open}
      noContentPadding
    >
      <ListWrapper>
        <Row>
          <Text className="gray">Receive at least</Text>
          <Text>{details.receiveAmount}</Text>
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
        {details.accountCreationAmount && false ? (
          <Row>
            <Text className="gray">USDC account creation</Text>
            <Text>{details.accountCreationAmount}</Text>
          </Row>
        ) : undefined}
        {elCompensationFee}
      </ListWrapper>
      {elTotal}
    </Accordion>
  );
};

FeesOriginal.defaultProps = defaultProps;
