import type { FC } from 'react';

import { styled } from '@linaria/react';
import type { Network } from '@saberhq/solana-contrib';

import { Icon } from 'components/ui';
import { getExplorerUrl } from 'utils/connection';

const Link = styled.a`
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

const ExplorerIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

interface Props {
  signature: string | null;
  network: Network;
}

export const SolanaExplorerLink: FC<Props> = ({ signature, network }) => {
  return (
    <Link
      href={signature ? getExplorerUrl('tx', signature, network) : ''}
      target="_blank"
      rel="noopener noreferrer noindex"
    >
      <ExplorerIcon name="external" />
      View in Solana explorer
    </Link>
  );
};
