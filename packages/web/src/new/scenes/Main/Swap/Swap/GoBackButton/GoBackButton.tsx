import { generatePath, useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Button, Icon } from 'components/ui';

const Wrapper = styled.div``;

const ActionIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-right: 8px;

  color: ${theme.colors.textIcon.active};
`;

const ButtonStyled = styled(Button)`
  border: 1px solid ${theme.colors.stroke.primary};
`;

export const GoBackButton = () => {
  const navigate = useNavigate();
  const { publicKey } = useParams<'publicKey'>();

  const handleButtonClick = () => {
    const pathTemplate = `/swap${publicKey ? '/:publicKey' : ''}`;
    navigate(generatePath(pathTemplate, { publicKey }));
  };

  return (
    <Wrapper>
      <ButtonStyled small onClick={handleButtonClick}>
        <ActionIcon name="arrow-left" />
        Go back to swap
      </ButtonStyled>
    </Wrapper>
  );
};
