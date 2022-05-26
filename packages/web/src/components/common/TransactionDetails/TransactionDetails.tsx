import type { FC } from 'react';

import { styled } from '@linaria/react';
import type { u64 } from '@saberhq/token-utils';

import type { UseSendState } from 'app/contexts';
import { AmountUSDStyled } from 'components/pages/swap/SwapWidget/AmountUSD';
import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

export interface TransactionDetailsProps {
  sendState?: UseSendState;
  btcAddress?: string;
  isOpen?: boolean;
  amount?: u64;
}

const TokenAndUsd = styled.div`
  display: flex;
`;

export const TransactionDetails: FC<TransactionDetailsProps> = ({ sendState, amount }) => {
  /*const {
    settings: { useFreeTransactions },
  } = useSettings();*/

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Transaction details"
          titleBottomName="Total"
          titleBottomValue={sendState?.details.totalAmount || ''}
        />
      }
      open={false}
      noContentPadding
    >
      <ListWrapper>
        <Row>
          <Text className="gray">Receive</Text>
          <TokenAndUsd>
            <Text>{sendState?.details.receiveAmount}</Text>
            <AmountUSDStyled
              prefix="(~"
              postfix=")"
              amount={sendState?.parsedAmount?.toU64() || amount}
              tokenName={sendState?.fromTokenAccount?.balance?.token.symbol}
            />
          </TokenAndUsd>
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
        {/*sendState?.details.accountCreationAmount ? (
          <Row>
            <Text className="gray">{sendState.destinationAccount?.symbol} account creation</Text>
            <TokenAndUsd>
              <Text>{sendState.details.accountCreationAmount}</Text>
              <AmountUSDStyled
                prefix="(~"
                postfix=")"
                amount={networkFees?.accountRentExemption}
                tokenName={sendState.fromTokenAccount?.balance?.token.symbol}
              />
            </TokenAndUsd>
          </Row>
        ) : undefined*/}
      </ListWrapper>
      <ListWrapper className="total">
        <Row>
          <Text>Total</Text>
          <TokenAndUsd>
            <Text>{sendState?.details.totalAmount}</Text>
            <AmountUSDStyled
              prefix="(~"
              postfix=")"
              amount={sendState?.parsedAmount?.toU64() || amount}
              tokenName={sendState?.fromTokenAccount?.balance?.token.symbol}
            />
          </TokenAndUsd>
        </Row>
      </ListWrapper>
    </Accordion>
  );
};
