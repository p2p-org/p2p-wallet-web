import type { FC, HTMLAttributes } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
`;

const IconStyled = styled(Icon)`
  width: 20px;
  height: 20px;

  color: ${theme.colors.textIcon.buttonPrimary};
`;

interface Props extends HTMLAttributes<HTMLDivElement> {
  name: string;
}

export const NavButtonIcon: FC<Props> = ({ name, className }) => {
  return (
    <Wrapper className={className}>
      <IconStyled name={name} />
    </Wrapper>
  );
};
