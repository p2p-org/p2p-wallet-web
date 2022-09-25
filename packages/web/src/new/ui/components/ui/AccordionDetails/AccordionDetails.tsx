import type { FC, ReactElement } from 'react';

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
  title: string | ReactElement;
  value: AccordionRowValue;
  titleClassName?: string;
  valueClassName?: string;
};

export type AccordionItem = {
  id: number | string;
  className?: string;
  rows: AccordionRow[];
};

export type AccordionList = AccordionItem[];

interface Props {
  title: string | ReactElement;
  titleBottomName: string | ReactElement;
  titleBottomValue?: string;
  accordion: AccordionList;
}

export const AccordionDetails: FC<Props> = (props) => {
  return (
    <Accordion title={<AccordionTitle {...props} />} noContentPadding>
      {props.accordion.map((list) => (
        <ListWrapper key={list.id} className={list.className}>
          {list.rows.map((row) => (
            <Row key={row.id}>
              <Text className={row.titleClassName}>{row.title}</Text>
              <Text className={row.valueClassName}>
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
