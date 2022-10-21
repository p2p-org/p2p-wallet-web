import type { FC } from 'react';
import { useMemo } from 'react';
import { generatePath, useParams } from 'react-router';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';

import { FeesView } from '../Subviews/FeesView';
import type { SwapViewModel } from '../Swap/Swap.ViewModel';
import type { SwapRouteParams } from '../Swap/types';
import { DescriptionView } from './Subviews/DescriptionView';
import { SegmentedControl } from './Subviews/SegmentedControl';

const Wrapper = styled.div`
  display: grid;
  grid-row-gap: 16px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;

  & > :first-child {
    border: 1px solid ${theme.colors.stroke.secondary};
    border-bottom: none;
    border-radius: 12px 12px 0 0;
  }

  & > :last-child {
    border: 1px solid ${theme.colors.stroke.primary};
    border-radius: 0 0 12px 12px;
  }
`;

const SlippageWrapper = styled.div`
  display: grid;
  grid-row-gap: 16px;
  padding: 16px 16px 20px 16px;
`;

const Title = styled.span`
  font-weight: 500;
  font-size: 14px;
  line-height: 120%;
`;

/*const CompensationWrapper = styled.div`
  padding: 0 20px;
`;*/

interface Props {
  viewModel: Readonly<SwapViewModel>;
}

export const SwapSettings: FC<Props> = observer(({ viewModel: vm }) => {
  const viewModel = vm.swapSettingsViewModel;
  // const viewModel = useViewModel(SwapSettingsViewModel);
  const { symbol } = useParams<SwapRouteParams>();
  const backToPath = useMemo(() => generatePath('/swap/:symbol?', { symbol }), [symbol]);

  return (
    <WidgetPageWithBottom title={['Swap', 'Swap settings']} backTo={backToPath}>
      <Wrapper>
        <Content>
          <SlippageWrapper>
            <Title>Max price slippage</Title>
            <SegmentedControl viewModel={viewModel} />
          </SlippageWrapper>
          <DescriptionView />
        </Content>
        <FeesView items={viewModel.feesContent} />
      </Wrapper>
    </WidgetPageWithBottom>
  );
});
