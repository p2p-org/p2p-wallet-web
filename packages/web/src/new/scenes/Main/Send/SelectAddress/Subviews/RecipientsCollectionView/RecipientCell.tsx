import type { FC } from 'react';

import type { Recipient } from 'new/scenes/Main/Send';
import { RecipientView } from 'new/scenes/Main/Send/SelectAddress/RecipientView';

interface Props {
  recipient?: Recipient;
  isPlaceholder?: boolean;
  onRecipientClick?: () => void;
  onClearClick?: () => void;
}

export const RecipientCell: FC<Props> = ({
  recipient,
  isPlaceholder,
  onRecipientClick,
  onClearClick,
}) => {
  return (
    <RecipientView
      recipient={recipient}
      isPlaceholder={isPlaceholder}
      onRecipientClick={onRecipientClick}
      onClearClick={onClearClick}
    />
  );
};
