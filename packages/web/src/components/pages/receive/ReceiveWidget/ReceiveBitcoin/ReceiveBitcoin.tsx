import type { FC } from 'react';
import { useState } from 'react';

import { LockAndMintBtc } from './LockAndMintBtc';
import { RenGatewayWarning } from './RenGatewayWarning';

export const ReceiveBitcoin: FC = () => {
  const [isShowGatewayAddress, setIsShowGatewayAddress] = useState(false); // false

  if (isShowGatewayAddress) {
    return <LockAndMintBtc />;
  }

  return <RenGatewayWarning onShowButtonClick={() => setIsShowGatewayAddress(true)} />;
};
