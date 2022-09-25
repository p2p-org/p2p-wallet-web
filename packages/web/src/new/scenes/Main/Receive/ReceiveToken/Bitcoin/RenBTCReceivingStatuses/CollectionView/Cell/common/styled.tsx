import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

export const Title = styled.div`
  display: grid;
  grid-gap: 4px;

  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
`;

export const Label = styled.div``;

export const Description = styled.div`
  color: ${theme.colors.textIcon.secondary};

  font-size: 14px;
  line-height: 140%;

  &.green {
    color: ${theme.colors.system.successMain};
  }
`;

export const Value = styled.div`
  font-weight: 700;
  text-align: end;

  &.green {
    color: ${theme.colors.system.successMain};
  }

  &.red {
    color: ${theme.colors.system.errorMain};
  }
`;
