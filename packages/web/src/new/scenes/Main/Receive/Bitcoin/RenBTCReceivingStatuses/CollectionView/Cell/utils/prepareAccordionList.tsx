import type { ReactElement } from 'react';

import { u64 } from '@solana/spl-token';
import classNames from 'classnames';

import { LockAndMintProcessingTx } from 'new/sdk/RenVM/actions/LockAndMint';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import type { AccordionItem, AccordionList } from 'new/ui/components/ui/AccordionDetails';
import { numberToString } from 'new/utils/NumberExtensions';

import { Description, Label, Title, Value } from '../common/styled';
import type { Record } from '../Record';
import { Status } from '../Record';

export const prepareAccordionList = (records: Record[]): AccordionList => {
  const renderValue = (record: Record): ReactElement | null => {
    let text;
    let className = 'black';

    let vout: number;
    let max: number;

    switch (record.status) {
      case Status.waitingForConfirmation:
        vout = record.vout || 0;
        max = LockAndMintProcessingTx.maxVote;

        text = `${vout}/${max}`;

        if (vout === 0) {
          className = 'red';
        } else if (vout === max) {
          className = 'green';
        }
        break;
      case Status.minted:
        text = `+ ${numberToString(convertToBalance(new u64(record.amount || 0), 8), {
          maximumFractionDigits: 9,
        })} renBTC`;
        className = 'green';
        break;
    }

    if (text) {
      return <Value className={classNames({ [className]: true })}>{text}</Value>;
    }

    return null;
  };

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
          value: renderValue(record),
          valueClassName: 'contentVerticalCenter',
        },
      ],
    };

    return item;
  });
};
