import type { FC } from 'react';
import { useMemo } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import {
  RenBTCReceivingStatusesRecord,
  Status,
} from 'new/scenes/Main/Receive/Bitcoin/RenBTCReceivingStatuses/RenBTCReceivingStatuses.Record';
import type { LockAndMintProcessingTx } from 'new/sdk/RenVM/actions/LockAndMint';
import type { AccordionItem, AccordionList } from 'new/ui/components/ui/AccordionDetails';
import { AccordionDetails } from 'new/ui/components/ui/AccordionDetails';
import { numberToString } from 'new/utils/NumberExtensions';

const Wrapper = styled.div`
  &:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const Title = styled.div`
  display: grid;
  grid-gap: 4px;

  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
`;

const Label = styled.div``;

const Description = styled.div`
  color: ${theme.colors.textIcon.secondary};

  font-size: 14px;
  line-height: 140%;

  &.green {
    color: ${theme.colors.system.successMain};
  }
`;

type Props = {
  processingTx: LockAndMintProcessingTx;
};

export const Cell: FC<Props> = ({ processingTx }) => {
  /*const title = (
    <Title>
      <Label>{`${numberToString(processingTx.value, {
        maximumFractionDigits: 9,
      })} renBTC`}</Label>
      <Description className={classNames({ green: processingTx.mintedAt })}>
        {processingTx.statusString}
      </Description>
    </Title>
  );*/

  const title = `${numberToString(processingTx.value, {
    maximumFractionDigits: 9,
  })} renBTC`;

  const titleBottomName = (
    <Description className={classNames({ green: processingTx.mintedAt })}>
      {processingTx.statusString}
    </Description>
  );

  const records = useMemo(() => {
    const records: RenBTCReceivingStatusesRecord[] = [];
    if (processingTx.mintedAt) {
      records.push(
        new RenBTCReceivingStatusesRecord({
          txid: processingTx.tx.txid,
          status: Status.minted,
          time: processingTx.mintedAt,
          amount: processingTx.tx.value,
        }),
      );
    }
    if (processingTx.submittedAt) {
      records.push(
        new RenBTCReceivingStatusesRecord({
          txid: processingTx.tx.txid,
          status: Status.submitted,
          time: processingTx.submittedAt,
        }),
      );
    }
    if (processingTx.confirmedAt) {
      records.push(
        new RenBTCReceivingStatusesRecord({
          txid: processingTx.tx.txid,
          status: Status.confirmed,
          time: processingTx.confirmedAt,
        }),
      );
    }
    if (processingTx.threeVoteAt) {
      records.push(
        new RenBTCReceivingStatusesRecord({
          txid: processingTx.tx.txid,
          status: Status.waitingForConfirmation,
          time: processingTx.threeVoteAt,
          vout: 3,
        }),
      );
    }
    if (processingTx.twoVoteAt) {
      records.push(
        new RenBTCReceivingStatusesRecord({
          txid: processingTx.tx.txid,
          status: Status.waitingForConfirmation,
          time: processingTx.twoVoteAt,
          vout: 2,
        }),
      );
    }
    if (processingTx.oneVoteAt) {
      records.push(
        new RenBTCReceivingStatusesRecord({
          txid: processingTx.tx.txid,
          status: Status.waitingForConfirmation,
          time: processingTx.oneVoteAt,
          vout: 1,
        }),
      );
    }
    if (processingTx.receivedAt) {
      records.push(
        new RenBTCReceivingStatusesRecord({
          txid: processingTx.tx.txid,
          status: Status.waitingForConfirmation,
          time: processingTx.receivedAt,
          vout: 0,
        }),
      );
    }

    records.sort((rc1, rc2) => {
      if (rc1.time === rc2.time) {
        return (rc1.vout || 0) - (rc2.vout || 0);
      } else {
        return rc1.time - rc2.time;
      }
    });

    return records;
  }, [processingTx]);

  const accordion = useMemo<AccordionList>(() => {
    return records.map<AccordionItem>((record) => {
      const item: AccordionItem = {
        id: record.txid,
        className: 'slim',
        rows: [
          {
            id: 1,
            title: (
              <Title>
                <Label>{record.stringValue}</Label>
                <Description>{new Date(record.time).toLocaleString()}</Description>
              </Title>
            ),
            value: null,
          },
        ],
      };

      return item;
    });
  }, [records]);

  return (
    <Wrapper>
      <AccordionDetails title={title} titleBottomName={titleBottomName} accordion={accordion} />
    </Wrapper>
  );
};
