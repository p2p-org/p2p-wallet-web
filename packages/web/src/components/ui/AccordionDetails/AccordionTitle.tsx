import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

const AccordionTitleWrapper = styled.div`
  display: grid;
  grid-gap: 4px;

  font-weight: 500;
  letter-spacing: 0.01em;
`;

const AccordionTitlePrimary = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-size: 16px;
  line-height: 140%;
`;

const AccordionTitleSecondary = styled.div`
  display: flex;

  color: ${theme.colors.textIcon.secondary};
  font-size: 14px;
  line-height: 120%;
`;

const AccordionTitleSecondaryValue = styled.div`
  margin-left: 4px;

  color: ${theme.colors.textIcon.primary};
`;

interface Props {
  title: string;
  titleBottomName: string;
  titleBottomValue: string;
}

export const AccordionTitle: FC<Props> = ({ title, titleBottomName, titleBottomValue }) => {
  return (
    <AccordionTitleWrapper>
      <AccordionTitlePrimary>{title}</AccordionTitlePrimary>
      <AccordionTitleSecondary>
        {titleBottomName}:
        <AccordionTitleSecondaryValue>{titleBottomValue}</AccordionTitleSecondaryValue>
      </AccordionTitleSecondary>
    </AccordionTitleWrapper>
  );
};
