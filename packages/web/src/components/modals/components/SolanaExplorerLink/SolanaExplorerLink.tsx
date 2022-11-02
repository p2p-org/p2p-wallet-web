import type { FC } from 'react';

import type { Network } from '@saberhq/solana-contrib';
import classNames from 'classnames';

import {
  GoToExplorerIcon,
  GoToExplorerLink,
} from 'components/modals/TransactionInfoModals/common/styled';
import type { AmplitudeActions } from 'utils/analytics/types';
import { getExplorerUrl } from 'utils/connection';

export interface IProps {
  signature: string | null;
  network: Network;
  amplitudeAction: AmplitudeActions;
}

export const SolanaExplorerLink: FC<IProps> = (props) => {
  return (
    <GoToExplorerLink
      href={props.signature ? getExplorerUrl('tx', props.signature, props.network) : ''}
      target="_blank"
      rel="noopener noreferrer noindex"
      className={classNames({
        isDisabled: !props.signature,
      })}
    >
      <GoToExplorerIcon name={'external'} />
      View in Solana explorer
    </GoToExplorerLink>
  );
};
