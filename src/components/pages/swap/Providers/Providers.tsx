import React, { FC } from 'react';

import { ConfigProvider, PoolsProvider, PriceProvider, UserProvider } from 'app/contexts/swap';

export const Providers: FC = ({ children }) => {
  return (
    <ConfigProvider>
      <UserProvider>
        <PoolsProvider>
          <PriceProvider>{children}</PriceProvider>
        </PoolsProvider>
      </UserProvider>
    </ConfigProvider>
  );
};
