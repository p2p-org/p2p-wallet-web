import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Button, Icon } from 'components/ui';

import { useShowSettings } from '../../hooks/useShowSettings';

const Wrapper = styled.div`
  position: relative;
`;

const ActionIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-right: 8px;

  color: ${theme.colors.textIcon.active};
`;

const ButtonStyled = styled(Button)`
  border: 1px solid ${theme.colors.stroke.primary};
`;

export const SettingsAction: FunctionComponent = () => {
  const { handleShowSettings } = useShowSettings();

  return (
    <Wrapper>
      <ButtonStyled small onClick={handleShowSettings}>
        <ActionIcon name="gear" />
        Swap settings
      </ButtonStyled>
    </Wrapper>
  );
};
