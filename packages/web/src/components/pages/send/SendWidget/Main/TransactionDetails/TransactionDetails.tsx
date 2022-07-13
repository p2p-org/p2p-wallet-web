import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { useConfig, useNetworkFees, useSendState } from 'app/contexts';
import { formatBigNumber } from 'app/contexts/solana/swap/utils/format';
import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { ListWrapper, Row, Text } from 'components/ui/AccordionDetails/common';

const AddressNotMatchError = styled.span`
  color: ${theme.colors.system.errorMain};
`;

const titleBottomNameEl = (isAddressNotMatchNetwork: boolean) =>
  isAddressNotMatchNetwork ? (
    <AddressNotMatchError>The address and the network don’t match</AddressNotMatchError>
  ) : (
    'Total'
  );

const titleBottomValueEl = (isAddressNotMatchNetwork: boolean, detailsTotalAmount: string) =>
  isAddressNotMatchNetwork ? '' : detailsTotalAmount;

export const TransactionDetails: FC = () => {
  /*const {
    settings: { useFreeTransactions },
  } = useSettings();*/
  const { details, isAddressNotMatchNetwork, destinationAccount } = useSendState();
  const { isNeedCreate } = destinationAccount || {};
  const { accountRentExemption } = useNetworkFees();
  const { tokenConfigs } = useConfig();

  if (!details.receiveAmount) {
    return null;
  }

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Transaction details"
          titleBottomName={titleBottomNameEl(isAddressNotMatchNetwork)}
          titleBottomValue={titleBottomValueEl(isAddressNotMatchNetwork, details.totalAmount || '')}
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
        {isNeedCreate ? (
          <Row>
            <Text className="gray">{destinationAccount?.symbol} account creation</Text>
            <Text>
              {formatBigNumber(accountRentExemption, tokenConfigs['SOL']?.decimals || 0)} SOL
            </Text>
          </Row>
        ) : null}
        {/*!fromTokenAccount?.balance?.token.isRawSOL ? (
          <CompensationFee
            type="send"
            isShow={!fromTokenAccount?.balance?.token.isRawSOL}
            accountSymbol={destinationAccount?.symbol || ''}
          />
        ) : undefined*/}
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
