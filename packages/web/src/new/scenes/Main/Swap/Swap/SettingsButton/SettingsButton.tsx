import type { FC } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Button, Icon } from 'components/ui';

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
  const { publicKey } = useParams<{ publicKey?: string }>();

  const handleShowSettings = () => {
    const pathTemplate = `/swap/settings${publicKey ? '/:publicKey' : ''}`;
    navigate(generatePath(pathTemplate, { publicKey }));
  };

  return (
    <ButtonStyled small onClick={handleShowSettings}>
      <ActionIcon name="gear" />
      Swap settings
    </ButtonStyled>
  );
};
