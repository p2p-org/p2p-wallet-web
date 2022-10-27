import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme, useIsMobile } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { trackEvent1 } from 'new/sdk/Analytics';
import type { Token } from 'new/sdk/SolanaSDK';
import { Select, SelectItem } from 'new/ui/components/common/Select';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';
import { getAvatarSize } from 'new/utils/common';

import type { ReceiveViewModel, TokenTypeName } from '../../Receive.ViewModel';
import { TokenType } from '../../Receive.ViewModel';

const InfoWrapper = styled.div`
  margin-left: 12px;
`;

const Line = styled.div`
  line-height: 17px;
`;

const Text = styled.div`
  display: inline-block;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.01em;

  &.bottom {
    color: ${theme.colors.textIcon.primary};
    font-size: 16px;
  }

  &::first-letter {
    text-transform: uppercase;
  }
`;

const Network = styled.div`
  margin-left: 12px;

  &::first-letter {
    text-transform: uppercase;
  }
`;

const TOKEN_TYPE_ITEMS = [TokenType.solana, TokenType.btc];

type Props = {
  viewModel: ReceiveViewModel;
};

export const NetworkSelect: FC<Props> = observer(({ viewModel }) => {
  const isMobile = useIsMobile();

  const title = 'Showing my address for';
  const avatarSize = getAvatarSize(isMobile);

  const getToken = (tokenType: TokenType): Token | undefined =>
    tokenType.isSolana() ? viewModel.solanaToken : viewModel.btcToken;

  const switchToken = (typeName: TokenTypeName): void => {
    const newTokenType = new TokenType(typeName);

    if (newTokenType.isSolana()) {
      viewModel.switchTokenType(newTokenType);
    } else {
      // track event - user clicked Bitcoin Network in selector
      trackEvent1({ name: 'Receive_Bitcoin_Network' });

      if (viewModel.isRenBtcCreated()) {
        viewModel.switchTokenType(newTokenType);
      } else {
        void viewModel.openReceiveBitcoinModal<boolean>().then((result) => {
          if (result) {
            viewModel.switchTokenType(newTokenType);
          }
        });
      }
    }
  };

  return (
    <Select
      mobileListTitle={title}
      value={
        <>
          <TokenAvatar token={getToken(viewModel.tokenType)} size={44} />
          <InfoWrapper>
            <Line>
              <Text>{title}</Text>
            </Line>
            <Line>
              <Text className="bottom">{viewModel.tokenType.name} network</Text>
            </Line>
          </InfoWrapper>
        </>
      }
    >
      {TOKEN_TYPE_ITEMS.map((tokenType) => (
        <SelectItem
          key={tokenType.type}
          isSelected={tokenType.type === viewModel.tokenType.type}
          onItemClick={() => switchToken(tokenType.type)}
        >
          <TokenAvatar token={getToken(tokenType)} size={avatarSize} />
          <Network>{tokenType.name} network</Network>
        </SelectItem>
      ))}
    </Select>
  );
});
