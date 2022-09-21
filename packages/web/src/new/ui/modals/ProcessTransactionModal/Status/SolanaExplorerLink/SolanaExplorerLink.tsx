import type { FC } from 'react';

import { styled } from '@linaria/react';
import type { Network } from '@saberhq/solana-contrib';
import classNames from 'classnames';

import { Icon } from 'components/ui';
import { getExplorerUrl } from 'new/utils/StringExtensions';

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;

  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

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

interface Props {
  signature: string;
  network?: Network;
}

export const SolanaExplorerLink: FC<Props> = ({ signature, network }) => {
  return (
    <Footer>
      <GoToExplorerLink
        href={getExplorerUrl('tx', signature, network)}
        target="_blank"
        rel="noopener noreferrer noindex"
        className={classNames({
          isDisabled: !signature,
        })}
      >
        <GoToExplorerIcon name="external" />
        View in Solana explorer
      </GoToExplorerLink>
    </Footer>
  );
};
