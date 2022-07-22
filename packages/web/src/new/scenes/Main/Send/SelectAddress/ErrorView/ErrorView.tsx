import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import type { RecipientsListViewModel } from 'new/scenes/Main/Send/SelectAddress/Subviews/RecipientsCollectionView/RecipientsList.ViewModel';

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  padding: 16px 20px;

  border-top: 1px solid ${theme.colors.stroke.secondary};
`;

const IconWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: ${theme.colors.system.errorBg};
  border-radius: 12px;
`;

const RoundStopIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.system.errorMain};
`;

const Text = styled.span`
  margin-left: 12px;

  color: ${theme.colors.system.errorMain};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

interface Props {
  viewModel: RecipientsListViewModel;
}

export const ErrorView: FC<Props> = observer(({ viewModel }) => {
  let shouldHideErrorView = true;
  let errorText = 'There is an error occurred. Please try again';
  switch (viewModel.state) {
    case SDFetcherState.initializing:
    case SDFetcherState.loading:
      break;
    case SDFetcherState.loaded:
      if (viewModel.data.length === 0 && viewModel.searchString) {
        shouldHideErrorView = false;
        errorText = 'There’s no address like this';
      }
      break;
    case SDFetcherState.error:
      shouldHideErrorView = false;
      break;
  }

  if (shouldHideErrorView) {
    return null;
  }

  return (
    <Wrapper>
      <IconWrapper>
        <RoundStopIcon name="round-stop" />
      </IconWrapper>
      <Text>{errorText}</Text>
    </Wrapper>
  );
});
