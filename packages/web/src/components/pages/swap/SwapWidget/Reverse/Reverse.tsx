import type { FC } from 'react';

import { styled } from '@linaria/react';

import { useSwap } from 'app/contexts/solana/swap';
import { Icon } from 'components/ui';
import { trackEvent } from 'utils/analytics';

const Wrapper = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  justify-content: center;
`;

const ReverseWrapper = styled.div`
  position: absolute;
  top: -24px;

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
  const { switchTokens } = useSwap();

  const handleReverseClick = () => {
    switchTokens();

    trackEvent('Swap_Reversing');
  };

  return (
    <Wrapper>
      <ReverseWrapper onClick={handleReverseClick}>
        <ReverseIcon name="swap" />
      </ReverseWrapper>
    </Wrapper>
  );
};
