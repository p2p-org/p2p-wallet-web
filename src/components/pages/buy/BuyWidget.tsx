import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { WidgetPage } from 'components/common/WidgetPage';

import { TransakWidget } from './TransakWidget';

const WrapperWidgetPage = styled(WidgetPage)``;

export const BuyWidget: FC = () => {
  return (
    <WrapperWidgetPage title="Buy" icon="plus">
      <TransakWidget />
    </WrapperWidgetPage>
  );
};
