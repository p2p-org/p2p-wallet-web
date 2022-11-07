import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import type { FeeCellContent } from 'new/scenes/Main/Swap/SwapSettings/SwapSettings.ViewModel';
import { BaseWalletCellContent } from 'new/ui/components/common/BaseWalletCellContent';
import { Select, SelectItem } from 'new/ui/components/common/Select';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';

const SelectorValue = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const TokenAvatarStyled = styled(TokenAvatar)`
  margin-right: 12px;
`;

const Fees = styled.div`
  flex-grow: 1;
`;

const Top = styled.div``;

const Label = styled.span`
  margin-right: 4px;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;

  &.primary {
    color: ${theme.colors.textIcon.primary};
    font-size: 16px;
  }
`;

const LabelWrapper = styled.div`
  display: grid;
  grid-row-gap: 2px;
`;

type Props = {
  items: FeeCellContent[];
  flat?: boolean;
};

export const FeesView: FC<Props> = observer(({ items, flat = false }) => {
  const selectedItem = expr(() => items.find((item) => item.isSelected));

  return (
    <Select
      flat={flat}
      mobileListTitle="Pay swap fees with"
      value={
        <SelectorValue>
          <TokenAvatarStyled token={selectedItem?.wallet?.token} size={44} />
          <Fees>
            <Top>
              <LabelWrapper>
                <Label>Pay swap fees with</Label>
                <Label className="primary">{selectedItem?.wallet?.token.symbol}</Label>
              </LabelWrapper>
            </Top>
          </Fees>
        </SelectorValue>
      }
    >
      {items.map((item) => (
        <SelectItem
          key={item.wallet?.pubkey}
          onItemClick={item.onClick}
          isSelected={item.isSelected}
        >
          <BaseWalletCellContent wallet={item.wallet} isMobilePopupChild />
        </SelectItem>
      ))}
    </Select>
  );
});
