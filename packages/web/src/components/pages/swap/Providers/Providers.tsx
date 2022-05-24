import type { FC } from 'react';

import { ConfigProvider, PoolsProvider, UserProvider } from 'app/contexts/solana/swap';

export const Providers: FC = ({ children }) => {
  return (
    <ConfigProvider>
      <UserProvider>
        <PoolsProvider>{children}</PoolsProvider>
      </UserProvider>
    </ConfigProvider>
  );
};
