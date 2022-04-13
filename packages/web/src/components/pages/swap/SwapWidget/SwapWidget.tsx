import type { FC } from 'react';

import { styled } from '@linaria/react';
import { useIsMobile } from '@p2p-wallet-web/ui';

import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';

import { Fees } from './Fees';
import { Reverse } from './Reverse';
import { SettingsAction } from './SettingsAction';
import { SwapButton } from './SwapButton';
import { SwapFromForm } from './SwapFromForm';
import { SwapToForm } from './SwapToForm';

const ActionsWrapper = styled.div`
  display: flex;

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const Wrapper = styled.div``;

export const SwapWidget: FC = () => {
  const isMobile = useIsMobile();

  const actionElement = () => {
    return !isMobile ? (
      <ActionsWrapper>
        <SettingsAction />
      </ActionsWrapper>
    ) : undefined;
  };

  return (
    <WidgetPageWithBottom title="Swap" icon="swap" bottom={<SwapButton />} action={actionElement}>
      <Wrapper>
        <SwapFromForm />
        <Reverse />
        <SwapToForm />
      </Wrapper>
      <Fees />
    </WidgetPageWithBottom>
  );
};
