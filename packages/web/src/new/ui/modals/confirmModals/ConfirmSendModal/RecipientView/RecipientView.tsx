import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { AddressText } from 'components/common/AddressText';
import type { SendViewModel } from 'new/scenes/Main/Send';

import {
  FieldInfo,
  IconWrapper,
  InfoTitle,
  InfoValue,
  InfoWrapper,
  To,
  Username,
  WalletIcon,
} from '../../common/styled';

interface Props {
  viewModel: Readonly<SendViewModel>;
}

export const RecipientView: FC<Props> = observer(({ viewModel }) => {
  const recipient = viewModel.recipient!;

  return (
    <FieldInfo>
      <IconWrapper>
        <WalletIcon name="wallet" />
      </IconWrapper>
      <InfoWrapper>
        {recipient.name ? (
          <Username>
            <To>To</To>
            {recipient.name}
          </Username>
        ) : (
          <InfoTitle className="secondary">To address</InfoTitle>
        )}
        <InfoValue>
          <AddressText address={recipient.address} medium />
        </InfoValue>
      </InfoWrapper>
    </FieldInfo>
  );
});
