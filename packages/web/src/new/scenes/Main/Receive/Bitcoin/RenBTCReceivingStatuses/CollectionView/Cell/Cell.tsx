import type { FC } from 'react';
import { useMemo } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Description } from 'new/scenes/Main/Receive/Bitcoin/RenBTCReceivingStatuses/CollectionView/Cell/common/styled';
import type { Record } from 'new/scenes/Main/Receive/Bitcoin/RenBTCReceivingStatuses/CollectionView/Cell/Record';
import { prepareAccordionList } from 'new/scenes/Main/Receive/Bitcoin/RenBTCReceivingStatuses/CollectionView/Cell/utils/prepareAccordionList';
import { prepareRecords } from 'new/scenes/Main/Receive/Bitcoin/RenBTCReceivingStatuses/CollectionView/Cell/utils/prepareRecords';
import type { LockAndMintProcessingTx } from 'new/sdk/RenVM/actions/LockAndMint';
import type { AccordionList } from 'new/ui/components/ui/AccordionDetails';
import { AccordionDetails } from 'new/ui/components/ui/AccordionDetails';
import { numberToString } from 'new/utils/NumberExtensions';

const Wrapper = styled.div`
  &:not(:last-child) {
    margin-bottom: 16px;
  }
`;

type Props = {
  processingTx: LockAndMintProcessingTx;
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
