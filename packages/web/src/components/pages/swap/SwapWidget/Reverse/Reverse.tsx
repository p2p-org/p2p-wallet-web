import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';

import { useSwap } from 'app/contexts/solana/swap';
import { Icon } from 'components/ui';
import { trackEvent } from 'utils/analytics';

const Wrapper = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  padding-left: 72px;

  ${up.tablet} {
    justify-content: center;
    padding-left: 0;
  }
`;

const ReverseWrapper = styled.div`
  position: absolute;
  top: -24px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;

  cursor: pointer;
`;

const ReverseIcon = styled(Icon)`
  width: 100%;
  height: 100%;

  color: ${theme.colors.textIcon.active};
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
        <ReverseIcon name="swap-bordered" />
      </ReverseWrapper>
    </Wrapper>
  );
};
