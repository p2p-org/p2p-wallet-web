import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import {
  ConfigProvider,
  PoolsProvider,
  PriceProvider,
  SwapProvider,
  UserProvider,
} from 'app/contexts/swap';

export const Providers: FC = ({ children }) => {
  const { symbol } = useParams<{ symbol?: string }>();

  return (
    <ConfigProvider>
      <UserProvider>
        <PoolsProvider>
          <PriceProvider>
            <SwapProvider initialState={{ inputTokenName: symbol }}>{children}</SwapProvider>
          </PriceProvider>
        </PoolsProvider>
      </UserProvider>
    </ConfigProvider>
  );
};
