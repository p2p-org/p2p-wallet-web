import type { FC } from 'react';

import { styled } from '@linaria/react';
import { u64 } from '@saberhq/token-utils';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import type { UseSendState } from 'app/contexts';
import { useConfig, useSettings } from 'app/contexts';
import type { INITIAL_USER_FREE_FEE_LIMITS } from 'app/contexts/api/feeRelayer/utils';
import { FeeTransactionTooltip } from 'components/common/TransactionDetails/FeeTransactinTooltip';
import { AmountUSDStyled } from 'components/pages/swap/SwapWidget/AmountUSD';
import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

export interface TransactionDetailsProps {
  sendState: UseSendState;
  userFreeFeeLimits: typeof INITIAL_USER_FREE_FEE_LIMITS;
  btcAddress?: string;
  isOpen?: boolean;
}

const TokenAndUsd = styled.div`
  display: flex;
`;

export const TransactionDetails: FC<TransactionDetailsProps> = ({
  sendState,
  userFreeFeeLimits,
}) => {
  const {
    settings: { useFreeTransactions },
  } = useSettings();
  const { tokenConfigs } = useConfig();

  const totalUsdAmount = new u64(
    parseFloat(sendState.fromAmount) * LAMPORTS_PER_SOL,
    tokenConfigs[sendState.fromTokenAccount?.balance?.token?.symbol as string]?.decimals as number,
  );
  const receiveUsdAmount = new u64(
    parseFloat(sendState.fromAmount) * LAMPORTS_PER_SOL,
    tokenConfigs[sendState.fromTokenAccount?.balance?.token?.symbol as string]?.decimals as number,
  );

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Transaction details"
          titleBottomName="Total"
          titleBottomValue={sendState.details.totalAmount || ''}
        />
      }
      open={false}
      noContentPadding
    >
      <ListWrapper>
        <Row>
          <Text className="gray">Receive</Text>
          <TokenAndUsd>
            <Text>{sendState.details.receiveAmount}</Text>
            <AmountUSDStyled
              prefix="~"
              amount={receiveUsdAmount}
              tokenName={sendState.fromTokenAccount?.balance?.token.symbol}
            />
          </TokenAndUsd>
        </Row>
        <Row>
          <Text className="gray">Transaction fee</Text>
          {useFreeTransactions ? (
            <Text>
              Free{' '}
              <Text className="green inline-flex">
                (Paid by P2P.org)
                <FeeTransactionTooltip userFreeFeeLimits={userFreeFeeLimits} />
              </Text>
            </Text>
          ) : (
            <Text>1</Text>
          )}
        </Row>
        {sendState.details.accountCreationAmount ? (
          <Row>
            <Text className="gray">{sendState.destinationAccount?.symbol} account creation</Text>
            <Text>{sendState.details.accountCreationAmount}</Text>
          </Row>
        ) : undefined}
      </ListWrapper>
      <ListWrapper className="total">
        <Row>
          <Text>Total</Text>
          <TokenAndUsd>
            <Text>{sendState.details.totalAmount}</Text>
            <AmountUSDStyled
              prefix="~"
              amount={totalUsdAmount}
              tokenName={sendState.fromTokenAccount?.balance?.token.symbol}
            />
          </TokenAndUsd>
        </Row>
      </ListWrapper>
    </Accordion>
  );
};
