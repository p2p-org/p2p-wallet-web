import type { FunctionComponent, HTMLAttributes } from 'react';
import { useMemo } from 'react';

import { styled } from '@linaria/react';
import { useAllTokens } from '@p2p-wallet-web/core';
import type { Token } from '@saberhq/token-utils';
import classNames from 'classnames';

import { Jazzicon } from 'components/common/TokenAvatar/Jazzicon';
import { Avatar } from 'components/ui';

import wrappedImage from './images/wrapped.svg';

const Wrapper = styled.div`
  position: relative;

  border-radius: 12px;

  &.isNotExists {
    background: #f6f6f8;
  }
`;

const WrappedBy = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;

  width: 16px;
  height: 16px;

  background: #000;
  border: 1px solid #464646;
  border-radius: 4px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.25));

  &.isWrapped {
    background-image: url(${wrappedImage});
    background-repeat: no-repeat;
    background-position: center;
    background-size: 16px 16px;
  }
`;

type Props = {
  size?: string | number;
  token?: Token;
  symbol?: string; // TODO: remove
  address?: string; // TODO: remove
};

export const TokenAvatar: FunctionComponent<Props & HTMLAttributes<HTMLDivElement>> = ({
  token,
  symbol,
  address,
  className,
  ...props
}) => {
  const { tokenMap, tokens } = useAllTokens();

  // TODO: remove
  const tokenInfo = useMemo(() => {
    if (token) {
      return null;
    }

    return (
      (address && tokenMap[address]) ||
      tokens.find((token) => token.symbol === symbol || token.address === address)
    );
  }, [address, symbol, token, tokenMap, tokens]); // TODO: remove

  const isWrapped = useMemo(() => {
    if (token) {
      return token.hasTag('wrapped');
    }

    return tokenInfo?.hasTag('wrapped');
  }, [token, tokenInfo]);

  return (
    <Wrapper className={classNames(className, { isNotExists: !tokenInfo || !token })}>
      {token ? (
        <Avatar src={token.icon} {...props} />
      ) : (!tokenInfo || !tokenInfo.icon) && address ? (
        <Jazzicon address={address} {...props} />
      ) : (
        <Avatar src={tokenInfo?.icon || undefined} {...props} />
      )}
      {isWrapped ? (
        <WrappedBy
          className={classNames({
            isWrapped,
          })}
        />
      ) : undefined}
    </Wrapper>
  );
};
