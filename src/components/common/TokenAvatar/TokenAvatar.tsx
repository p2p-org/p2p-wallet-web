import React, { FunctionComponent, HTMLAttributes, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import tokenList from 'api/token/token.config';
import { Avatar } from 'components/ui';
import { RootState } from 'store/rootReducer';

import wrappedImage from './images/wrapped.svg';

const Wrapper = styled.div`
  position: relative;

  border-radius: 12px;

  &.isNotExists {
    background: #f6f6f8;
  }
`;

const AvatarStyled = styled(Avatar)``;

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
};

export const TokenAvatar: FunctionComponent<Props & HTMLAttributes<HTMLDivElement>> = ({
  symbol,
  src,
  className,
  ...props
}) => {
  const cluster = useSelector((state: RootState) => state.wallet.cluster);
  const tokenInfo = tokenList
    .filterByClusterSlug(cluster)
    .getList()
    .find((token) => token.symbol === symbol);

  const isWrapped = useMemo(() => tokenInfo?.tags?.find((tag) => tag.includes('wrapped')), [
    tokenInfo,
  ]);

  return (
    <Wrapper className={classNames(className, { isNotExists: !tokenInfo?.logoURI })}>
      <AvatarStyled src={tokenInfo?.logoURI || undefined} {...props} />
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
