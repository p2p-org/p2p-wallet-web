import type { FC } from 'react';

import {
  BottomWrapper,
  Content,
  ExplorerA,
  ShareIcon,
} from 'components/pages/receive/ReceiveWidget/common/styled';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { UsernameAddressWidget } from 'new/ui/components/common/UsernameAddressWidget';
import { withNameServiceDomain } from 'new/utils/StringExtensions';

import { ReceiveSolanaViewModel } from './ReceiveSolana.ViewModel';

export const ReceiveSolana: FC = () => {
  const viewModel = useViewModel(ReceiveSolanaViewModel);

  return (
    <>
      <Content className="noTopPadding">
        <UsernameAddressWidget
          address={viewModel.pubkeyBase58}
          username={viewModel.username && withNameServiceDomain(viewModel.username)}
        />
      </Content>
      <BottomWrapper>
        <ExplorerA
          href={`https://explorer.solana.com/address/${viewModel.pubkeyBase58}`}
          target="_blank"
          rel="noopener noreferrer noindex"
          className="button"
        >
          <ShareIcon name="external" />
          View in Solana explorer
        </ExplorerA>
      </BottomWrapper>
    </>
  );
};
