import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { CSSProperties } from '@linaria/core';
import { styled } from '@linaria/react';

import tokenConfig from 'api/token/token.config';
import { Avatar } from 'components/ui';
import { RootState } from 'store/rootReducer';

const AvatarStyled = styled(Avatar)`
  background: ${({ src }) => (src ? 'none' : '#f6f6f8')};
`;

type Props = {
  src?: string;
  size?: string | number;
  symbol?: string;
  style?: CSSProperties;
  className?: string;
};

export const TokenAvatar: FunctionComponent<Props> = ({ symbol, src, ...props }) => {
  const cluster = useSelector((state: RootState) => state.wallet.cluster);

  let newSrc: string | undefined = src;

  if (!src) {
    if (symbol === 'SOL') {
      newSrc =
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png';
    } else {
      newSrc = tokenConfig[cluster]?.find((token) => token.tokenSymbol === symbol)?.icon;
    }
  }

  return <AvatarStyled src={newSrc} {...props} />;
};
