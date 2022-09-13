import { styled } from '@linaria/react';
import { up } from '@p2p-wallet-web/ui';

export const Content = styled.div`
  display: grid;
  grid-gap: 16px;
  padding: 16px 20px;

  ${up.tablet} {
    padding: 16px 36px;
  }

  &.noTopPadding {
    padding-top: 0;
  }
`;
