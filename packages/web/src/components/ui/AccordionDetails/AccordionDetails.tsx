import type { FC } from 'react';

import { trackEvent } from 'utils/analytics';

import { Accordion } from '../Accordion';
import { AccordionTitle } from './AccordionTitle';
import { ListWrapper, Row, Text } from './common';

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

export const AccordionDetails: FC<Props> = (props) => {
  const handleToggle = (isOpen: boolean) => {
    if (isOpen) {
      trackEvent('Buy_Fees_Showed');
    }
  };

  return (
    <Accordion title={<AccordionTitle {...props} />} onToggle={handleToggle} noContentPadding>
      {props.accordion.map((list) => (
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
