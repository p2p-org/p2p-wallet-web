import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';

export const Title = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  margin-left: 16px;
  padding: 16px 0 0 12px;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.01em;

  cursor: pointer;

  ${up.tablet} {
    margin-left: initial;
    padding-left: 8px;
  }
`;
