import React, { FunctionComponent, HTMLAttributes } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import tokenConfig, { SOL_AVATAR_URL } from 'api/token/token.config';
import { Avatar } from 'components/ui';
import { RootState } from 'store/rootReducer';

const AvatarStyled = styled(Avatar)`
  background: ${({ src }) => (src ? 'none' : '#f6f6f8')};
`;

type Props = {
  src?: string;
  size?: string | number;
  symbol?: string;
};

export const TokenAvatar: FunctionComponent<Props & HTMLAttributes<HTMLDivElement>> = ({
  symbol,
  src,
  ...props
}) => {
  const cluster = useSelector((state: RootState) => state.wallet.cluster);

  let newSrc: string | undefined = src;

  if (!src) {
    if (symbol === 'SOL') {
      newSrc = SOL_AVATAR_URL;
    } else {
      newSrc = tokenConfig[cluster]?.find((token) => token.tokenSymbol === symbol)?.icon;
    }
  }

  return <AvatarStyled src={newSrc} {...props} />;
};
