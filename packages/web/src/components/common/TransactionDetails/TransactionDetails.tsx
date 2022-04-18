import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import type { u64 } from '@saberhq/token-utils';

import type { NetworkFees, UseSendState } from 'app/contexts';
import { useSettings } from 'app/contexts';
import type { INITIAL_USER_FREE_FEE_LIMITS } from 'app/contexts/api/feeRelayer/utils';
import { AddressText } from 'components/common/AddressText';
import { FeeTransactionTooltip } from 'components/common/TransactionDetails/FeeTransactinTooltip';
import {
  IconWrapper,
  InfoTitle,
  InfoValue,
  InfoWrapper,
  WalletIcon,
} from 'components/modals/TransactionConfirmModal/common/styled';
import { AmountUSDStyled } from 'components/pages/swap/SwapWidget/AmountUSD';
import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

export interface TransactionDetailsProps {
  sendState: UseSendState;
  userFreeFeeLimits: typeof INITIAL_USER_FREE_FEE_LIMITS;
  networkFees: NetworkFees;
  btcAddress?: string;
  isOpen?: boolean;
  amount?: u64;
}

// @FIXME move to styled
const TokenAndUsd = styled.div`
  display: flex;
`;

const SenderAddress = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;

  border-bottom: 1px solid ${theme.colors.stroke.secondary};
`;

export const TransactionDetails: FC<TransactionDetailsProps> = ({
  sendState,
  userFreeFeeLimits,
  networkFees,
  amount,
}) => {
  const {
    settings: { useFreeTransactions },
  } = useSettings();
  const senderAddress = sendState?.fromTokenAccount?.key?.toBase58();

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
      <SenderAddress>
        <IconWrapper>
          <WalletIcon name="wallet" />
        </IconWrapper>
        <InfoWrapper>
          <InfoTitle className="secondary">Sender address</InfoTitle>
          <InfoValue>{senderAddress && <AddressText address={senderAddress} medium />}</InfoValue>
        </InfoWrapper>
      </SenderAddress>
      <ListWrapper>
        <Row>
          <Text className="gray">Receive</Text>
          <TokenAndUsd>
            <Text>{sendState.details.receiveAmount}</Text>
            <AmountUSDStyled
              prefix="~"
              amount={sendState.parsedAmount?.toU64() || amount}
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
            <TokenAndUsd>
              <Text>{sendState.details.accountCreationAmount}</Text>
              <AmountUSDStyled
                prefix="~"
                amount={networkFees?.accountRentExemption}
                tokenName={sendState.fromTokenAccount?.balance?.token.symbol}
              />
            </TokenAndUsd>
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
              amount={sendState.parsedAmount?.toU64() || amount}
              tokenName={sendState.fromTokenAccount?.balance?.token.symbol}
            />
          </TokenAndUsd>
        </Row>
      </ListWrapper>
    </Accordion>
  );
};
