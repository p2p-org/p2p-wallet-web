import type { FC } from 'react';

import { BLOCKCHAINS, useSendState } from 'app/contexts';
import { Select, SelectItem } from 'components/ui';

export const NetworkSelect: FC = () => {
  const { blockchain, setBlockchain } = useSendState();

  return (
    <>
      <Select value={blockchain} mobileListTitle="Choose the network">
        {BLOCKCHAINS.map((itemBlockchain) => (
          <SelectItem
            key={itemBlockchain}
            isSelected={itemBlockchain === blockchain}
            onItemClick={() => setBlockchain(itemBlockchain)}
          >
            {itemBlockchain}
          </SelectItem>
        ))}
      </Select>
    </>
  );
};
