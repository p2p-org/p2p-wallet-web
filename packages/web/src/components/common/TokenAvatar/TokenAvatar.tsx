import type { FunctionComponent, HTMLAttributes } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import { useTokensContext } from '@p2p-wallet-web/core';
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
  size?: number;
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
  const { tokenMap, tokens } = useTokensContext();
  const [isDead, setIsDead] = useState<boolean>(false);

  useEffect(() => {
    setIsDead(false);
  }, [token?.icon]);

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

  const elAvatar = () => {
    const commonAttr = {
      onError: () => setIsDead(true),
    };

    if (token && !isDead) {
      return <Avatar src={token.icon} {...props} {...commonAttr} />;
    }

    if (token && isDead) {
      return <Jazzicon address={token.address} size={props.size} />;
    }

    if ((!tokenInfo || !tokenInfo.icon) && address) {
      return <Jazzicon address={address} size={props.size} />;
    }

    return <Avatar src={tokenInfo?.icon || undefined} {...props} {...commonAttr} />;
  };

  return (
    <Wrapper className={classNames(className, { isNotExists: !tokenInfo || !token })}>
      {elAvatar()}
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
