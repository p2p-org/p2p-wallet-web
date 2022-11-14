import type { FC } from 'react';
import { generatePath, useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Button, Icon } from 'components/ui';

import type { SwapRouteParams } from '../types';

const ActionIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-right: 8px;

  color: ${theme.colors.textIcon.active};
`;

const ButtonStyled = styled(Button)`
  border: 1px solid ${theme.colors.stroke.primary};
`;

export const SettingsButton: FC = () => {
  const navigate = useNavigate();
  const { publicKey } = useParams<SwapRouteParams>();

  const handleShowSettings = () => {
    navigate(generatePath('/swap/settings/:publicKey?', { publicKey }));
  };

  return (
    <ButtonStyled small onClick={handleShowSettings}>
      <ActionIcon name="gear" />
      Swap settings
    </ButtonStyled>
  );
};
