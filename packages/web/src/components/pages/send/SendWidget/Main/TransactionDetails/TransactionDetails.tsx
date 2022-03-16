import type { FC } from 'react';
import { useMemo } from 'react';

import { ZERO } from '@orca-so/sdk';
import { useNativeAccount } from '@p2p-wallet-web/sail';
import { TokenAmount } from '@saberhq/token-utils';

import { useFeeCompensation, useFreeFeeLimits, useSendState, useSettings } from 'app/contexts';
import { CompensationFee } from 'components/common/CompensationFee';
import { FreeTransactionTooltip } from 'components/common/TransactionDetails/FreeTransactionTooltip';
import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

export const TransactionDetails: FC = () => {
  const {
    settings: { useFreeTransactions },
  } = useSettings();
  const { compensationState, feeToken, feeAmountInToken } = useFeeCompensation();
  const { fromTokenAccount, parsedAmount, destinationAccount, setTotalAmount } = useSendState();
  const { userFreeFeeLimits } = useFreeFeeLimits();
  const nativeAccount = useNativeAccount();

  const details = useMemo(() => {
    let receiveAmount;

    if (!parsedAmount && fromTokenAccount && fromTokenAccount.balance) {
      receiveAmount = new TokenAmount(fromTokenAccount.balance.token, 0).formatUnits();
    } else if (parsedAmount) {
      receiveAmount = parsedAmount.formatUnits();
    }

    let totlalAmount = receiveAmount;
    let accountCreationAmount;

    if (compensationState.totalFee.gt(ZERO)) {
      if (feeToken?.balance?.token.isRawSOL && nativeAccount.nativeBalance) {
        accountCreationAmount = new TokenAmount(
          nativeAccount.nativeBalance.token,
          compensationState.estimatedFee.accountRent,
        ).formatUnits();

        totlalAmount += ` + ${accountCreationAmount}`;
      } else {
        if (feeToken && feeToken.balance) {
          const accontCreationTokenAmount = new TokenAmount(
            feeToken?.balance?.token,
            feeAmountInToken,
          );

          accountCreationAmount = accontCreationTokenAmount.formatUnits();

          totlalAmount = parsedAmount
            ? parsedAmount.add(accontCreationTokenAmount).formatUnits()
            : accountCreationAmount;
        }
      }
    }

    setTotalAmount(totlalAmount);

    return {
      receiveAmount,
      accountCreationAmount,
      totlalAmount,
    };
  }, [
    compensationState,
    feeAmountInToken,
    feeToken,
    fromTokenAccount,
    nativeAccount,
    parsedAmount,
  ]);

  if (!details.receiveAmount) {
    return null;
  }

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
          <Text className="gray">Receive</Text>
          <Text>
            {details.receiveAmount}
            {/* <Text className="gray">(~$150)</Text> */}
          </Text>
        </Row>
        <Row>
          <Text className="gray">Transaction fee</Text>
          {useFreeTransactions ? (
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
          ) : (
            <Text>1</Text>
          )}
        </Row>
        {details.accountCreationAmount ? (
          <Row>
            <Text className="gray">{destinationAccount?.symbol} account creation</Text>
            <Text>
              {details.accountCreationAmount}
              {/* <Text className="gray">(~$0.5)</Text> */}
            </Text>
          </Row>
        ) : undefined}
        {!fromTokenAccount?.balance?.token.isRawSOL ? (
          <CompensationFee
            type="send"
            isShow={!fromTokenAccount?.balance?.token.isRawSOL}
            accountSymbol={destinationAccount?.symbol || ''}
          />
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
