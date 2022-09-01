import type { FC } from 'react';
import { useMount } from 'react-use';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import type { Recipient, SendViewModel } from 'new/scenes/Main/Send';
import { AttentionView } from 'new/scenes/Main/Send/SelectAddress/AttentionView';
import { ErrorView } from 'new/scenes/Main/Send/SelectAddress/ErrorView';
import { InputState } from 'new/scenes/Main/Send/SelectAddress/SelectAddress.ViewModel';

import { AddressInputView } from './AddressInputView';
import { RecipientView } from './RecipientView';
import { RecipientsCollectionView } from './Subviews/RecipientsCollectionView';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  border: 1px solid ${theme.colors.stroke.secondary};
  border-radius: 12px;
`;

const CommonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  margin-bottom: 8px;
`;

const Title = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const RecipientsCollectionViewStyled = styled(RecipientsCollectionView)`
  &:not(:empty) {
    padding: 16px 20px;

    border-top: 1px solid ${theme.colors.stroke.secondary};
  }
`;

interface Props {
  viewModel: Readonly<SendViewModel>;
}

export const SelectAddress: FC<Props> = observer(({ viewModel }) => {
  const vm = viewModel.selectAddressViewModel;

  useMount(() => vm.recipientsListViewModel.reload());

  // input state
  const isSearching = expr(() => vm.inputState === InputState.searching);

  // searching empty state
  const shouldHideNetwork = expr(() => {
    if (vm.preSelectedNetwork === null) {
      return isSearching;
    } else {
      // show preselected network when search is empty
      return !(!isSearching || !vm.searchText);
    }
  });

  const handleRecipientClick = (recipient: Recipient) => {
    vm.selectRecipient(recipient);
  };

  const handleClearClick = () => {
    vm.clearRecipient();
    vm.clearSearching();
  };

  return (
    <Wrapper>
      <CommonWrapper>
        <TopWrapper>
          <Title>From</Title>
        </TopWrapper>
        {isSearching ? (
          <AddressInputView viewModel={vm} />
        ) : (
          <RecipientView
            recipient={viewModel.recipient ?? undefined}
            onClearClick={handleClearClick}
          />
        )}
      </CommonWrapper>
      {/* NetworkView */}
      <ErrorView viewModel={vm.recipientsListViewModel} />
      <AttentionView viewModel={viewModel} />
      {!shouldHideNetwork ? null : (
        <RecipientsCollectionViewStyled
          viewModel={vm.recipientsListViewModel}
          onRecipientClick={handleRecipientClick}
        />
      )}
      {/* WarningView */}
    </Wrapper>
  );
});
