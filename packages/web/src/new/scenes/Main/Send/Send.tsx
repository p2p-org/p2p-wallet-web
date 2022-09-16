import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Layout } from 'new/ui/components/common/Layout';

import { ActionButton } from './ActionButton';
import { ChooseTokenAndAmount } from './ChooseTokenAndAmount';
import { FeesView } from './FeesView';
import { SelectAddress } from './SelectAddress';
import { SendViewModel } from './Send.ViewModel';

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
