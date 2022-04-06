import type { FC } from 'react';

import type { UseSendState } from 'app/contexts';
import { useSettings } from 'app/contexts';
import type { INITIAL_USER_FREE_FEE_LIMITS } from 'app/contexts/api/feeRelayer/utils';
import { FeeToolTip } from 'components/common/TransactionDetails/FeeTransactinTooltip';
import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

export interface TransactionDetailsProps {
  sendState: Pick<UseSendState, 'fromTokenAccount' | 'destinationAccount' | 'details'>;
  userFreeFeeLimits: typeof INITIAL_USER_FREE_FEE_LIMITS;
  btcAddress?: string;
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
      open={false}
      noContentPadding
    >
      <ListWrapper>
        <Row>
          <Text className="gray">Receive</Text>
          <Text>{props.sendState.details.receiveAmount}</Text>
        </Row>
        <Row>
          <Text className="gray">Transaction fee</Text>
          {useFreeTransactions ? (
            <Text>
              Free{' '}
              <Text className="green inline-flex">
                (Paid by P2P.org)
                <FeeToolTip userFreeFeeLimits={props.userFreeFeeLimits} />
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
            <Text>{props.sendState.details.accountCreationAmount}</Text>
          </Row>
        ) : undefined}
      </ListWrapper>
      <ListWrapper className="total">
        <Row>
          <Text>Total</Text>
          <Text>{props.sendState.details.totalAmount}</Text>
        </Row>
      </ListWrapper>
    </Accordion>
  );
};
