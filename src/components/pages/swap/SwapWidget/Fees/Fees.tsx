import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { Accordion } from 'components/ui';

const Line = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Label = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
`;

const Value = styled.div`
  display: flex;
  margin-top: 4px;

  font-weight: 600;
  font-size: 16px;
`;

interface Props {}

export const Fees: FC<Props> = (props) => {
  return (
    <Accordion title="Swap fees">
      <Line>
        <Label>Network fee</Label>
        <Value>0.00409856 SOL</Value>
      </Line>
    </Accordion>
  );
};
