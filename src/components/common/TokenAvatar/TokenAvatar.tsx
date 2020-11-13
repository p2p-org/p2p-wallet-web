import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from 'linaria/react';

import { Avatar } from 'components/ui';
import { TOKENS_BY_ENTRYPOINT } from 'constants/tokens';
import { RootState } from 'store/types';

const AvatarStyled = styled(Avatar)`
  background: ${({ src }) => (src ? 'none' : '#c4c4c4')};
`;

type Props = {
  src?: string;
  size?: string | number;
  mint?: string;
  isSolanaEmpty?: boolean;
};

export const TokenAvatar: FunctionComponent<Props> = ({ mint, src, isSolanaEmpty, ...props }) => {
  const entrypoint = useSelector((state: RootState) => state.data.blockchain.entrypoint);

  let newSrc: string | undefined = src;

  if (!src) {
    if (!mint) {
      if (isSolanaEmpty) {
        newSrc =
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png';
      }
    } else {
      newSrc = TOKENS_BY_ENTRYPOINT[entrypoint]?.find((token) => token.mintAddress === mint)?.icon;
    }
  }

  return <AvatarStyled src={newSrc} {...props} />;
};
