import type { FC } from 'react';

import { styled } from '@linaria/react';
import type { Network } from '@saberhq/solana-contrib';
import classNames from 'classnames';

import { Icon } from 'components/ui';
import { trackEventUniversal } from 'utils/analytics';
import type { AmplitudeActions } from 'utils/analytics/types';
import { getExplorerUrl } from 'utils/connection';

import { Footer } from '../styled';

interface IProps {
  signature: string | null;
  network: Network;
  amplitudeAction: AmplitudeActions;
}

const GoToExplorerIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

const GoToExplorerLink = styled.a`
  display: inline-flex;
  align-items: center;

  font-weight: 500;
  font-size: 16px;
  line-height: 140%;

  text-decoration: none;

  &.isDisabled {
    pointer-events: none;
  }
`;

export const SolanaExplorerLink: FC<IProps> = (props) => {
  return (
    <Footer>
      <GoToExplorerLink
        href={props.signature ? getExplorerUrl('tx', props.signature, props.network) : ''}
        target="_blank"
        rel="noopener noreferrer noindex"
        onClick={() => {
          trackEventUniversal(props.amplitudeAction);
        }}
        className={classNames({
          isDisabled: !props.signature,
        })}
      >
        <GoToExplorerIcon name={'external'} />
        View in Solana explorer
      </GoToExplorerLink>
    </Footer>
  );
};
