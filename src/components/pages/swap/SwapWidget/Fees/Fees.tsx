import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { SOL_MINT, useSwap } from 'app/contexts/swap';
import { Accordion } from 'components/ui';

import { FeesOriginal } from './FeesOriginal';

const Line = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 12px 20px;
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

export const Fees: FC = () => {
  const { fromMint } = useSwap();

  const isSol = fromMint.equals(SOL_MINT);

  return (
    <Accordion title="Swap fees" noContentPadding>
      <Line>
        <Label>Liquidity provider fees</Label>
        <Value>0.22%</Value>
      </Line>
      {/*<Line>*/}
      {/*  <Label>Network fee</Label>*/}
      {/*  <Value>0.00409856 SOL</Value>*/}
      {/*</Line>*/}
      {isSol ? <FeesOriginal /> : <FeesOriginal />}
    </Accordion>
  );
};
