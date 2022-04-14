import { generatePath, useHistory, useParams } from 'react-router';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Button, Icon } from 'components/ui';

import type { SwapRouteParams } from '../../types';

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
  const history = useHistory();
  const { symbol } = useParams<SwapRouteParams>();
  const backToPath = generatePath('/swap/:symbol?', { symbol });

  const handleButtonClick = () => {
    history.push(backToPath);
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
