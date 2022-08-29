import type { FC, HTMLAttributes } from 'react';
import { useLayoutEffect, useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Avatar } from 'components/ui';
import type { Token } from 'new/sdk/SolanaSDK';

import wrappedImage from './images/wrapped.svg';
import { Jazzicon } from './Jazzicon';

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
};

// TODO: sync ios
export const TokenAvatar: FC<Props & HTMLAttributes<HTMLDivElement>> = ({
  token,
  className,
  ...props
}) => {
  const [isDead, setIsDead] = useState<boolean>(false);

  useLayoutEffect(() => {
    setIsDead(false);
  }, [token?.logoURI]);

  const isWrapped = useMemo(() => {
    if (token) {
      return !!token.wrappedBy;
    }

    return false;
  }, [token]);

  const elAvatar = () => {
    const commonAttr = {
      onError: () => setIsDead(true),
    };

    if (token?.logoURI && !isDead) {
      return <Avatar src={token.logoURI} {...props} {...commonAttr} />;
    }

    if (token && isDead) {
      return <Jazzicon address={token.address} size={props.size} />;
    }

    if (token?.address) {
      return <Jazzicon address={token.address} size={props.size} />;
    }

    return <Avatar src={token?.logoURI ?? undefined} {...props} {...commonAttr} />;
  };

  return (
    <Wrapper className={classNames(className, { isNotExists: !token })}>
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
