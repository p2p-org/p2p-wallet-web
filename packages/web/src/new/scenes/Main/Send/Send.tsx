import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { ActionButton } from 'new/scenes/Main/Send/ActionButton';
import { ChooseTokenAndAmount } from 'new/scenes/Main/Send/ChooseTokenAndAmount';
import { FeesView } from 'new/scenes/Main/Send/FeesView';
import { SelectAddress } from 'new/scenes/Main/Send/SelectAddress';
import { SendViewModel } from 'new/scenes/Main/Send/Send.ViewModel';
import { Layout } from 'new/ui/components/common/Layout';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 16px;
`;

export const Send: FC = observer(() => {
  const viewModel = useViewModel(SendViewModel);

  return (
    <Layout>
      <WidgetPageWithBottom title="Send" icon="top" bottom={<ActionButton viewModel={viewModel} />}>
        <Wrapper>
          <ChooseTokenAndAmount viewModel={viewModel} />
          <SelectAddress viewModel={viewModel} />
          <FeesView viewModel={viewModel} />
        </Wrapper>
      </WidgetPageWithBottom>
    </Layout>
  );
});
