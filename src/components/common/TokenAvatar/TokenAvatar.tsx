import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import tokenConfig from 'api/token/token.config';
import { Avatar } from 'components/ui';
import { RootState } from 'store/rootReducer';

const AvatarStyled = styled(Avatar)`
  background: ${({ src }) => (src ? 'none' : '#c4c4c4')};
`;

type Props = {
  src?: string;
  size?: string | number;
  mint?: string;
};

export const TokenAvatar: FunctionComponent<Props> = ({ mint, src, ...props }) => {
  const cluster = useSelector((state: RootState) => state.wallet.cluster);

  let newSrc: string | undefined = src;

  if (!src) {
    if (!mint) {
      newSrc =
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png';
    } else {
      newSrc = tokenConfig[cluster]?.find((token) => token.mintAddress === mint)?.icon;
    }
  }

  return <AvatarStyled src={newSrc} {...props} />;
};
