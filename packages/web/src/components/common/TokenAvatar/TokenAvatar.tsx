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
  token: inputToken,
  symbol,
  address,
  className,
  ...props
}) => {
  const { tokenMap, tokens } = useTokensContext();
  const [isDead, setIsDead] = useState<boolean>(false);

  useEffect(() => {
    setIsDead(false);
  }, [inputToken?.icon]);

  // TODO: remove
  const foundToken = useMemo(() => {
    if (inputToken) {
      return null;
    }

    return (
      (address && tokenMap[address]) ||
      tokens.find((token: Token) => token.symbol === symbol || token.address === address)
    );
  }, [address, symbol, inputToken, tokenMap, tokens]); // TODO: remove

  const isWrapped = useMemo(() => {
    const token = inputToken || foundToken;

    const wrappedTags = ['wrapped', 'wormhole', 'wrapped-sollet'];

    if (token) {
      if (token.symbol !== 'SOL') {
        if (
          wrappedTags.some((tag) => token.tags?.includes(tag)) ||
          token.name.toLowerCase().includes('wrapped')
        ) {
          return true;
        }
      }
    }

    return false;
  }, [inputToken, foundToken]);

  const elAvatar = () => {
    const commonAttr = {
      onError: () => setIsDead(true),
    };

    if (inputToken && !isDead) {
      return <Avatar src={inputToken.icon} {...props} {...commonAttr} />;
    }

    if (inputToken && isDead) {
      return <Jazzicon address={inputToken.address} size={props.size} />;
    }

    if ((!foundToken || !foundToken.icon) && address) {
      return <Jazzicon address={address} size={props.size} />;
    }

    return <Avatar src={foundToken?.icon || undefined} {...props} {...commonAttr} />;
  };

  return (
    <Wrapper className={classNames(className, { isNotExists: !foundToken || !inputToken })}>
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
