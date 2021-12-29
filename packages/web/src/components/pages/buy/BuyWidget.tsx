import type { FC } from 'react';

import { styled } from '@linaria/react';

import { WidgetPage } from 'components/common/WidgetPage';

import { MoonpayWidget } from './MoonpayWidget';

const WrapperWidgetPage = styled(WidgetPage)``;

export const BuyWidget: FC = () => {
  return (
    <WrapperWidgetPage title="Buy" icon="plus">
      <MoonpayWidget />
    </WrapperWidgetPage>
  );
};
