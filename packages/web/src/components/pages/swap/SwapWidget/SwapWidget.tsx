import type { FC } from 'react';

import { styled } from '@linaria/react';
import { useIsMobile } from '@p2p-wallet-web/ui';

import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';

import { Fees } from './Fees';
import { Reverse } from './Reverse';
import { SettingsButton } from './SettingsButton';
import { SwapButton } from './SwapButton';
import { SwapFromForm } from './SwapFromForm';
import { SwapToForm } from './SwapToForm';

const Wrapper = styled.div``;

export const SwapWidget: FC = () => {
  const isMobile = useIsMobile();

  const renderButton = () => {
    return !isMobile ? <SettingsButton /> : null;
  };

  return (
    <WidgetPageWithBottom title="Swap" icon="swap" bottom={<SwapButton />} action={renderButton()}>
      <Wrapper>
        <SwapFromForm />
        <Reverse />
        <SwapToForm />
      </Wrapper>
      <Fees />
    </WidgetPageWithBottom>
  );
};
