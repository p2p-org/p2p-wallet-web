import type { FC } from 'react';
import React from 'react';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';

import { Blockchain, useSendState } from 'app/contexts';
import { Item } from 'components/pages/send/SendWidget/Main/NetworkSelect/Item';
import type {
  SelectItemType,
  SelectItemValueType,
} from 'components/pages/send/SendWidget/Main/NetworkSelect/types';
import { Select, SelectItem } from 'components/ui';

const NotificationWrapper = styled.div`
  margin: 0 12px;
  padding: 16px 20px;

  font-weight: 400;
  font-size: 12px;
  line-height: 160%;

  background-color: ${theme.colors.system.successBg};

  border: 1px solid ${theme.colors.system.successMain};
  border-radius: 12px;

  ${up.tablet} {
    font-size: 14px;
  }
`;

const SELECT_ITEMS: SelectItemType[] = [
  {
    key: 'auto',
    icon: '',
    title: 'Match automatically',
    forValue: {
      title: 'The network',
      description: 'Will be matched automatically',
    },
  },
  {
    key: Blockchain.solana,
    symbol: 'SOL',
    title: 'Solana network',
    feeTitle: 'Transfer fees:',
    feeValue: '$0',
  },
  {
    key: 'notification',
  },
  {
    key: Blockchain.bitcoin,
    symbol: 'renBTC',
    title: 'Bitcoin network',
    feeTitle: 'Fees:',
    feeValue: '0.0002 renBTC + 0.0002 SOL',
  },
];

const valueEl = (currentItem: SelectItemValueType, isAddressNotMatchNetwork?: boolean) => (
  <Item item={currentItem} forValue={true} isAddressNotMatchNetwork={isAddressNotMatchNetwork} />
);

const notificationEl = () => {
  return (
    <NotificationWrapper>
      On the Solana network, the first 100 transactions in a day are paid by P2P.org. Subsequent
      transactions will be charged based on the Solana blockchain gas fee.
    </NotificationWrapper>
  );
};

export const NetworkSelect: FC = () => {
  const {
    blockchain,
    setBlockchain,
    isAutomatchNetwork,
    setIsAutomatchNetwork,
    isAddressNotMatchNetwork,
  } = useSendState();

  const handleSelectChange = (item: SelectItemValueType) => {
    if (item.key === 'auto') {
      setIsAutomatchNetwork(true);
      setBlockchain(Blockchain.solana);
      return;
    }

    setIsAutomatchNetwork(false);
    setBlockchain(item.key);
  };

  const selectValue = isAutomatchNetwork ? 'auto' : blockchain;
  const currentItem = SELECT_ITEMS.find((item) => item.key === selectValue) as SelectItemValueType;

  return (
    <>
      <Select
        value={valueEl(currentItem, isAddressNotMatchNetwork)}
        mobileListTitle="Choose the network"
      >
        {SELECT_ITEMS.map((item) =>
          item.key === 'notification' ? (
            <React.Fragment key={item.key}>{notificationEl()}</React.Fragment>
          ) : (
            <SelectItem
              key={item.key}
              isSelected={item === currentItem}
              onItemClick={() => handleSelectChange(item)}
            >
              <Item item={item} />
            </SelectItem>
          ),
        )}
      </Select>
    </>
  );
};
