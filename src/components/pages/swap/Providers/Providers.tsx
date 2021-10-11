import React, { FC } from 'react';

import {
  ConfigProvider,
  PoolsProvider,
  PriceProvider,
  SwapProvider,
  UserProvider,
} from 'app/contexts/swap';

export const Providers: FC = ({ children }) => {
  return (
    <ConfigProvider>
      <UserProvider>
        <PoolsProvider>
          <PriceProvider>
            <SwapProvider>{children}</SwapProvider>
          </PriceProvider>
        </PoolsProvider>
      </UserProvider>
    </ConfigProvider>
  );
};
