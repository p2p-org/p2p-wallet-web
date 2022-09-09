import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import type { SendViewModel } from 'new/scenes/Main/Send';
import { Defaults } from 'new/services/Defaults';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';
import { numberToString } from 'new/utils/NumberExtensions';

import { FieldInfo, InfoTitle, InfoValue, InfoWrapper } from '../../common/styled';

interface Props {
  viewModel: Readonly<SendViewModel>;
}

export const AmountSummaryView: FC<Props> = observer(({ viewModel }) => {
  const wallet = viewModel.wallet;
  const amount = viewModel.amount ?? 0;
  const amountInFiat = amount * (wallet?.priceInCurrentFiat ?? 0);

  return (
    <FieldInfo>
      <TokenAvatar token={wallet?.token} size={44} />
      <InfoWrapper>
        <InfoTitle>
          {numberToString(amount, { maximumFractionDigits: 9 })} {wallet?.token.symbol ?? ''}
        </InfoTitle>
        <InfoValue>
          {Defaults.fiat.symbol}
          {numberToString(amountInFiat, { maximumFractionDigits: 2 })}
        </InfoValue>
      </InfoWrapper>
    </FieldInfo>
  );
});
