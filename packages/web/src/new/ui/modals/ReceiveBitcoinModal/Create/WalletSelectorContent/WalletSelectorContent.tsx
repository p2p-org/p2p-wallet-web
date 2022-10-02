import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Defaults } from 'new/services/Defaults';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';
import type { ReceiveBitcoinModalViewModel } from 'new/ui/modals/ReceiveBitcoinModal/ReceiveBitcoinModal.ViewModel';
import { numberToString } from 'new/utils/NumberExtensions';

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

interface Props {
  viewModel: Readonly<ReceiveBitcoinModalViewModel>;
}

export const WalletSelectorContent: FC<Props> = observer(({ viewModel }) => {
  return (
    <SelectorValue>
      <TokenAvatarStyled token={viewModel.payingWallet?.token} size={44} />
      <Fees>
        <Top>
          <LabelWrapper>
            <Label>
              Account creation fee:{' '}
              <Label className="primary">
                ~{Defaults.fiat.symbol}
                {numberToString(viewModel.feeInFiat ?? 0, { maximumFractionDigits: 2 })}
              </Label>
            </Label>
            <Label className="primary">{viewModel.feeInText}</Label>
          </LabelWrapper>
        </Top>
      </Fees>
    </SelectorValue>
  );
});
