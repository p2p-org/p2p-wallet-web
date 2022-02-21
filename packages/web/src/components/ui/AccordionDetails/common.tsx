import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

export const ListWrapper = styled.div`
  display: grid;
  grid-gap: 4px;
  padding: 16px 20px;

  &.total {
    padding: 26px 20px;
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.stroke.secondary};
  }
`;

export const AccordionList = styled.div`
  display: grid;
  grid-gap: 4px;
  padding: 16px 20px;

  &.total {
    padding: 26px 20px;
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.stroke.secondary};
  }
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Text = styled.div`
  display: inline-block;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;

  &.inline-flex {
    display: inline-flex;
  }

  &.gray {
    color: ${theme.colors.textIcon.secondary};
  }

  &.green {
    color: ${theme.colors.system.successMain};
  }
`;
