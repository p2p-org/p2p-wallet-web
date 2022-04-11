import type { FC } from 'react';

import { styled } from '@linaria/react';

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
  return (
    <WidgetPageWithBottom
      title="Swap"
      icon="swap"
      bottom={<SwapButton />}
      action={
        <ActionsWrapper>
          <SettingsAction />
        </ActionsWrapper>
      }
    >
      <Wrapper>
        <SwapFromForm />
        <Reverse />
        <SwapToForm />
      </Wrapper>
      <Fees />
    </WidgetPageWithBottom>
  );
};
