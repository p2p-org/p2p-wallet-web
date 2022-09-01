import type { FC } from 'react';

import { styled } from '@linaria/react';
import { up } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import type { Recipient } from 'new/scenes/Main/Send';
import { RecipientCell } from 'new/scenes/Main/Send/SelectAddress/Subviews/RecipientsCollectionView/RecipientCell';
import type { RecipientsListViewModel } from 'new/scenes/Main/Send/SelectAddress/Subviews/RecipientsCollectionView/RecipientsList.ViewModel';
import { StaticSectionsCollectionView } from 'new/ui/components/common/StaticSectionsCollectionView';

const StaticSectionsCollectionViewStyled = styled(StaticSectionsCollectionView)`
  display: grid;
  grid-gap: 8px;

  ${up.tablet} {
    grid-gap: 16px;
    margin: initial;
  }
`;

interface Props {
  viewModel: Readonly<RecipientsListViewModel>;
  onRecipientClick: (recipient: Recipient) => void;
  className?: string;
}

export const RecipientsCollectionView: FC<Props> = observer(
  ({ viewModel, onRecipientClick, className }) => {
    return (
      <StaticSectionsCollectionViewStyled<Recipient>
        viewModel={viewModel}
        renderPlaceholder={(key) => <RecipientCell key={key} isPlaceholder />}
        renderItem={(recipient: Recipient) => (
          <RecipientCell
            key={recipient.name || recipient.address}
            recipient={recipient}
            onRecipientClick={() => onRecipientClick(recipient)}
          />
        )}
        className={className}
      />
    );
  },
);
