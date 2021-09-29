import React, { FunctionComponent, HTMLAttributes, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import tokenList from 'api/token/token.config';
import { useTokenMap } from 'app/contexts/swap/tokenList/hooks';
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
  src?: string;
  size?: string | number;
  symbol?: string;
  address?: string;
};

export const TokenAvatar: FunctionComponent<Props & HTMLAttributes<HTMLDivElement>> = ({
  symbol,
  address,
  src,
  className,
  ...props
}) => {
  const cluster = useSelector((state) => state.wallet.network.cluster);

  // TODO: need to add cluster
  const tokenMap = useTokenMap();
  const tokenInfo =
    tokenMap.get(address!) ||
    tokenList
      .filterByClusterSlug(cluster)
      .getList()
      .find((token) => token.symbol === symbol || token.address === address);

  const isWrapped = useMemo(() => tokenInfo?.tags?.find((tag) => tag.includes('wrapped')), [
    tokenInfo,
  ]);

  return (
    <Wrapper className={classNames(className, { isNotExists: !tokenInfo })}>
      {(!tokenInfo || !tokenInfo.logoURI) && address ? (
        <Jazzicon address={address} {...props} />
      ) : (
        <Avatar src={tokenInfo?.logoURI || undefined} {...props} />
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
