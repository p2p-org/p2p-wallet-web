import type { FC } from 'react';

import { useFreeFeeLimits, useSendState, useSettings } from 'app/contexts';
import { CompensationFee } from 'components/common/CompensationFee';
import { FreeTransactionTooltip } from 'components/common/TransactionDetails/FreeTransactionTooltip';
import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

export const TransactionDetails: FC = () => {
  const {
    settings: { useFreeTransactions },
  } = useSettings();
  const { fromTokenAccount, destinationAccount, details } = useSendState();
  const { userFreeFeeLimits } = useFreeFeeLimits();

  if (!details.receiveAmount) {
    return null;
  }

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Transaction details"
          titleBottomName="Total"
          titleBottomValue={details.totalAmount || ''}
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
            {details.totalAmount}
            {/* <Text className="gray">(~$150.5)</Text> */}
          </Text>
        </Row>
      </ListWrapper>
    </Accordion>
  );
};
