import type { FC, HTMLAttributes } from 'react';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';

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

const SwitchWrapper = styled.div`
  position: absolute;
  top: -24px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;

  cursor: pointer;
`;

const SwitchIcon = styled(Icon)`
  width: 100%;
  height: 100%;

  color: ${theme.colors.textIcon.active};
`;

type Props = HTMLAttributes<HTMLDivElement>;

export const SwitchButton: FC<Props> = ({ onClick }) => {
  return (
    <Wrapper>
      <SwitchWrapper onClick={onClick}>
        <SwitchIcon name="swap-bordered" />
      </SwitchWrapper>
    </Wrapper>
  );
};
