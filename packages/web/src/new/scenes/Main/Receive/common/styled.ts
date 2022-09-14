import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';

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

export const ExplorerA = styled.a`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 48px;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
`;

export const BottomWrapper = styled.div`
  display: flex;

  justify-content: center;
  padding: 15px 20px;

  font-weight: 600;
  font-size: 14px;
  line-height: 140%;

  border-top: 1px solid #f6f6f8;
`;

export const ShareIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 8px;

  color: ${theme.colors.textIcon.secondary};
`;
