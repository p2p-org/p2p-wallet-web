import type { FC } from 'react';
import React from 'react';

import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';

interface Props {
  bottom?: React.ReactNode;
  children: React.ReactNode;
}

export const WidgetPageBuy: FC<Props> = ({ bottom, children }) => {
  return (
    <WidgetPageWithBottom title="Buy Solana on Moonpay" icon="plus" bottom={bottom}>
      {children}
    </WidgetPageWithBottom>
  );
};
