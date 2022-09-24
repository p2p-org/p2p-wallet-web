import type { FC } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Hint } from 'new/scenes/Main/Receive/Bitcoin/Hint';
import { ReceiveBitcoinViewModel } from 'new/scenes/Main/Receive/Bitcoin/ReceiveBitcoin.ViewModel';
import { RenBTCReceivingStatuses } from 'new/scenes/Main/Receive/Bitcoin/RenBTCReceivingStatuses/RenBTCReceivingStatuses';
import {
  BottomWrapper,
  Content,
  ExplorerA,
  ShareIcon,
} from 'new/scenes/Main/Receive/common/styled';
import { LoaderBlock } from 'new/ui/components/common/LoaderBlock';
import { UsernameAddressWidget } from 'new/ui/components/common/UsernameAddressWidget';

export const ReceiveBitcoin: FC = observer(() => {
  const viewModel = useViewModel(ReceiveBitcoinViewModel);

  if (!viewModel.address) {
    return <LoaderBlock />;
  }

  return (
    <>
      <Content className="noTopPadding">
        {viewModel.address ? <UsernameAddressWidget address={viewModel.address} /> : null}
        <Hint remainingTime={viewModel.remainingTime} />
        <RenBTCReceivingStatuses />
      </Content>
      <BottomWrapper>
        <ExplorerA
          href={`https://btc.com/btc/address/${viewModel.address}`}
          target="_blank"
          rel="noopener noreferrer noindex"
          className={classNames({ button: true, disabled: !viewModel.address })}
        >
          <ShareIcon name="external" />
          View in Bitcoin explorer
        </ExplorerA>
      </BottomWrapper>
    </>
  );
});
