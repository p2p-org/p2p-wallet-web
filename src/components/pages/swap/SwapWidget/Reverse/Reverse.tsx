import React, { FC } from 'react';

import { styled } from '@linaria/react';
import { useSwapContext } from '@project-serum/swap-ui';

import { Icon } from 'components/ui';

const ReverseWrapper = styled.div`
  position: absolute;
  top: -24px;
  right: 32px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #5887ff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
`;

const ReverseIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #fff;
`;

export const Reverse: FC = () => {
  const { swapToFromMints } = useSwapContext();

  const handleReverseClick = () => {
    swapToFromMints();
  };

  return (
    <ReverseWrapper onClick={handleReverseClick}>
      <ReverseIcon name="swap" />
    </ReverseWrapper>
  );
};
