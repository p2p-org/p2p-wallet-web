import React, { FunctionComponent, HTMLAttributes } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import tokenConfig, { SOL_AVATAR_URL } from 'api/token/token.config';
import { Avatar } from 'components/ui';
import { RootState } from 'store/rootReducer';

import ftxImage from './images/ftx.png';

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

  &.isSollet {
    background-image: url(${ftxImage});
    background-repeat: no-repeat;
    background-position: center;
    background-size: 13px 13px;
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

  let newSrc: string | undefined = src;
  let wrappedBy: string | undefined;

  if (!src) {
    if (symbol === 'SOL') {
      newSrc = SOL_AVATAR_URL;
    } else {
      const tokenInfo = tokenConfig[cluster]?.find((token) => token.tokenSymbol === symbol);
      if (tokenInfo) {
        newSrc = tokenInfo?.icon;
        wrappedBy = tokenInfo?.wrappedBy;
      }
    }
  }

  return (
    <Wrapper className={classNames(className, { isNotExists: !newSrc })}>
      <AvatarStyled src={newSrc ? `${process.env.PUBLIC_URL}${newSrc}` : undefined} {...props} />
      {wrappedBy ? (
        <WrappedBy className={classNames({ isSollet: wrappedBy === 'sollet' })} />
      ) : undefined}
    </Wrapper>
  );
};
