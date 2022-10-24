import type { FC } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { trackEvent1 } from 'new/sdk/Analytics';
import { LoaderBlock } from 'new/ui/components/common/LoaderBlock';
import { UsernameAddressWidget } from 'new/ui/components/common/UsernameAddressWidget';

import { BottomWrapper, Content, ExplorerA, ShareIcon } from '../common/styled';
import { Hint } from './Hint';
import { ReceiveBitcoinViewModel } from './ReceiveBitcoin.ViewModel';
import { RenBTCReceivingStatuses } from './RenBTCReceivingStatuses';

export const ReceiveBitcoin: FC = observer(() => {
  const viewModel = useViewModel(ReceiveBitcoinViewModel);

  if (!viewModel.address) {
    return <LoaderBlock />;
  }

  const showReceivingStatuses = viewModel.processingTxs.length;

  return (
    <>
      <Content className="noTopPadding">
        {viewModel.address ? (
          <UsernameAddressWidget
            address={viewModel.address}
            onAddressCopied={() => {
              trackEvent1({ name: 'Receive_Address_Copied' });
            }}
          />
        ) : null}
        <Hint viewModel={viewModel} />
        {showReceivingStatuses ? <RenBTCReceivingStatuses /> : null}
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
