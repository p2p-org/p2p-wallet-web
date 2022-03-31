import type { FC } from 'react';

import type { UseSendState } from 'app/contexts';
import { useSettings } from 'app/contexts';
import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

export interface TransactionDetailsProps {
  sendState: Pick<UseSendState, 'fromTokenAccount' | 'destinationAccount' | 'details'>;
}

export const TransactionDetails: FC<TransactionDetailsProps> = (props) => {
  const {
    settings: { useFreeTransactions },
  } = useSettings();

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Transaction details"
          titleBottomName="Total"
          titleBottomValue={props.sendState.details.totalAmount || ''}
        />
      }
      open
      noContentPadding
    >
      <ListWrapper>
        <Row>
          <Text className="gray">Receive</Text>
          <Text>
            {props.sendState.details.receiveAmount}
            {/* <Text className="gray">(~$150)</Text> */}
          </Text>
        </Row>
        <Row>
          <Text className="gray">Transaction fee</Text>
          {useFreeTransactions ? (
            <Text>
              Free{' '}
              <Text className="green inline-flex">
                (Paid by P2P.org) {/*<FreeTransactionTooltip*/}
                {/*  freeTransactionCount={userFreeFeeLimits.maxTransactionCount}*/}
                {/*  currentTransactionCount={userFreeFeeLimits.currentTransactionCount}*/}
                {/*/>*/}
              </Text>
            </Text>
          ) : (
            <Text>1</Text>
          )}
        </Row>
        {props.sendState.details.accountCreationAmount ? (
          <Row>
            <Text className="gray">
              {props.sendState.destinationAccount?.symbol} account creation
            </Text>
            <Text>
              {props.sendState.details.accountCreationAmount}
              {/* <Text className="gray">(~$0.5)</Text> */}
            </Text>
          </Row>
        ) : undefined}
        {/*{!fromTokenAccount?.balance?.token.isRawSOL ? (*/}
        {/*  <CompensationFee*/}
        {/*    type="send"*/}
        {/*    isShow={!fromTokenAccount?.balance?.token.isRawSOL}*/}
        {/*    accountSymbol={destinationAccount?.symbol || ''}*/}
        {/*  />*/}
        {/*) : undefined}*/}
      </ListWrapper>
      <ListWrapper className="total">
        <Row>
          <Text>Total</Text>
          <Text>
            {props.sendState.details.totalAmount}
            {/* <Text className="gray">(~$150.5)</Text> */}
          </Text>
        </Row>
      </ListWrapper>
    </Accordion>
  );
};
