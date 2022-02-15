import type { FC } from 'react';

import { styled } from '@linaria/react';

import { BLOCKCHAINS, useSendState } from 'app/contexts';
import { Select, SelectItem } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  margin-bottom: 8px;
  padding: 12px 20px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

const NetworkSelectText = styled.div`
  display: flex;
  flex-grow: 1;

  font-weight: 600;
  font-size: 16px;
`;

export const NetworkSelect: FC = () => {
  const { blockchain, setBlockchain } = useSendState();

  return (
    <Wrapper>
      <NetworkSelectText>Network</NetworkSelectText>
      <Select value={blockchain}>
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
    </Wrapper>
  );
};
