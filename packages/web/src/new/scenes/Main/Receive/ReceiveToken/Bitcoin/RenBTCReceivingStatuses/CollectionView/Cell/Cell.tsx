import type { FC } from 'react';
import { useMemo } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import type { ProcessingTx } from 'new/sdk/RenVM';
import type { AccordionList } from 'new/ui/components/ui/AccordionDetails';
import { AccordionDetails } from 'new/ui/components/ui/AccordionDetails';
import { numberToString } from 'new/utils/NumberExtensions';

import { Description } from './common/styled';
import type { Record } from './Record';
import { prepareAccordionList } from './utils/prepareAccordionList';
import { prepareRecords } from './utils/prepareRecords';

const Wrapper = styled.div`
  &:not(:last-child) {
    margin-bottom: 16px;
  }
`;

type Props = {
  processingTx: ProcessingTx;
};

export const Cell: FC<Props> = ({ processingTx }) => {
  const title = `${numberToString(processingTx.value, {
    maximumFractionDigits: 9,
  })} renBTC`;

  const titleBottomName = (
    <Description className={classNames({ green: processingTx.mintedAt })}>
      {processingTx.statusString}
    </Description>
  );

  const records = useMemo<Record[]>(() => prepareRecords(processingTx), [processingTx]);

  const accordionList = useMemo<AccordionList>(() => prepareAccordionList(records), [records]);

  return (
    <Wrapper>
      <AccordionDetails title={title} titleBottomName={titleBottomName} accordion={accordionList} />
    </Wrapper>
  );
};
