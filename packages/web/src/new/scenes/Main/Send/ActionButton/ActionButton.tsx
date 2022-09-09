import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { Button, Icon } from 'components/ui';
import type { SendViewModel } from 'new/scenes/Main/Send';
import { numberToString } from 'new/utils/NumberExtensions';

const SendIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

interface Props {
  viewModel: Readonly<SendViewModel>;
}

export const ActionButton: FC<Props> = observer(({ viewModel }) => {
  const isDisabled = Boolean(viewModel.error);

  const handleClick = () => {
    void viewModel.openConfirmModal();
  };

  return (
    <Button primary full disabled={isDisabled} onClick={handleClick}>
      {viewModel.error?.buttonSuggestion ?? (
        <>
          <SendIcon name="top" />
          {`Send ${numberToString(viewModel.amount, {
            maximumFractionDigits: 9,
          })} ${viewModel.wallet?.token.symbol ?? ''}`}
        </>
      )}
    </Button>
  );
});
