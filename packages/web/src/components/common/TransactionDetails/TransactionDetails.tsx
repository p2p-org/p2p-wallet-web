import type { FC } from 'react';

import { styled } from '@linaria/react';

import type { UseSendState } from 'app/contexts';
import { useSettings } from 'app/contexts';
import type { INITIAL_USER_FREE_FEE_LIMITS } from 'app/contexts/api/feeRelayer/utils';
import { Accordion, LaagTooltip } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

export interface TransactionDetailsProps {
  sendState: Pick<UseSendState, 'fromTokenAccount' | 'destinationAccount' | 'details'>;
  userFreeFeeLimits: typeof INITIAL_USER_FREE_FEE_LIMITS;
}

const TooltipContent = styled.div`
  width: 300px;
`;

const MOCK_FREE_TRANSACTIONS = 100;

export const TransactionDetails: FC<TransactionDetailsProps> = (props) => {
  const {
    settings: { useFreeTransactions },
  } = useSettings();

  const elTooltip = (
    <TooltipContent>
      <span>On the Solana network, the first {props.userFreeFeeLimits.maxTransactionCount}</span>
      <span>
        transactions in a day are paid by P2P.org. You have
        {` ${props.userFreeFeeLimits.maxTransactionCount > 0 ? MOCK_FREE_TRANSACTIONS : 0} `}
        free transactions left for today
      </span>
      <br />
      <br /> Subsequent transactions will be charged based on the Solana blockchain gas fee.
    </TooltipContent>
  );

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
          <Text>{props.sendState.details.receiveAmount}</Text>
        </Row>
        <Row>
          <Text className="gray">Transaction fee</Text>
          {useFreeTransactions ? (
            <Text>
              Free{' '}
              <Text className="green inline-flex">
                (Paid by P2P.org)
                <LaagTooltip withClose={true} elContent={elTooltip} />
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
