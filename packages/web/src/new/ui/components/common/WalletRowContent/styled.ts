import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';

import { TokenAvatar } from '../TokenAvatar';

export const TokenAvatarStyled = styled(TokenAvatar)``;

export const TokenInfo = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: 22px 22px;
  grid-template-columns: 1fr 1fr;
`;

export const TokenName = styled.div`
  flex: 1;

  max-width: 300px;
  overflow: hidden;

  color: ${theme.colors.textIcon.primary};

  font-weight: 700;
  font-size: 14px;
  line-height: 140%;

  ${up.tablet} {
    font-weight: 600;
    font-size: 16px;
  }

  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const TokenBalance = styled.div`
  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 13px;
  line-height: 140%;

  ${up.tablet} {
    font-size: 14px;
  }
`;

export const TokenUSD = styled.div`
  grid-row: 1 / -1;
  align-self: center;
  justify-self: flex-end;

  color: #202020;
  font-weight: 600;
  font-size: 17px;
  line-height: 140%;

  ${up.tablet} {
    font-size: 18px;
  }
`;

export const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 12px;

  &.isMobilePopupChild {
    ${TokenInfo} {
      grid-template-rows: 20px 20px;
    }

    ${TokenName} {
      font-weight: 500;
    }

    ${TokenBalance} {
      font-size: 14px;
    }

    ${TokenUSD} {
      font-size: 16px;
    }
  }

  .isSelected & {
    ${TokenName} {
      font-weight: 700;
    }

    ${TokenUSD} {
      font-weight: 700;
    }
  }
`;
