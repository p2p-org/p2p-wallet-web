import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Accordion } from '../Accordion';

const AccordionTitle = styled.div`
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

const ListWrapper = styled.div`
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

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Text = styled.div`
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

type AccordionRowValueElement = {
  className?: string;
  value: React.ReactNode;
};

type AccordionRowValue = React.ReactNode | (React.ReactNode | AccordionRowValueElement)[];

type AccordionRow = {
  id: number;
  titleClassName?: string;
  title: string;
  value: AccordionRowValue;
};

type AccordionList = {
  id: number;
  className?: string;
  rows: AccordionRow[];
};

export type Accordion = AccordionList[];

interface Props {
  title: string;
  titleBottomName: string;
  titleBottomValue: string;
  accordion: Accordion;
}

export const AccordionDetails: FC<Props> = ({
  title,
  titleBottomName,
  titleBottomValue,
  accordion,
}) => {
  return (
    <Accordion
      title={
        <AccordionTitle>
          <AccordionTitlePrimary>{title}</AccordionTitlePrimary>
          <AccordionTitleSecondary>
            {titleBottomName}:
            <AccordionTitleSecondaryValue>{titleBottomValue}</AccordionTitleSecondaryValue>
          </AccordionTitleSecondary>
        </AccordionTitle>
      }
      noContentPadding
    >
      {accordion.map((list) => (
        <ListWrapper key={list.id} className={list.className}>
          {list.rows.map((row) => (
            <Row key={row.id}>
              <Text className={row.titleClassName}>{row.title}</Text>
              <Text>
                {Array.isArray(row.value)
                  ? row.value.map((el) =>
                      (el as AccordionRowValueElement).value ? (
                        <Text className={(el as AccordionRowValueElement).className}>
                          {(el as AccordionRowValueElement).value}
                        </Text>
                      ) : (
                        el
                      ),
                    )
                  : row.value}
              </Text>
            </Row>
          ))}
        </ListWrapper>
      ))}
    </Accordion>
  );
};
