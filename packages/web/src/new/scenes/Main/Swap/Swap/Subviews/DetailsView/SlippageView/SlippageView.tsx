import type { FC } from 'react';
import { useCallback } from 'react';
import { generatePath, useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';
import { Row, Text } from 'components/ui/AccordionDetails/common';
import type { SwapViewModel } from 'new/scenes/Main/Swap';

const PenIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  margin: auto 0;

  color: ${theme.colors.textIcon.secondary};

  cursor: pointer;
`;

interface Props {
  viewModel: Readonly<SwapViewModel>;
}

export const SlippageView: FC<Props> = ({ viewModel }) => {
  const navigate = useNavigate();
  const { publicKey } = useParams<'publicKey'>();

  const handleShowSettings = useCallback(() => {
    const pathTemplate = `/swap/settings${publicKey ? '/:publicKey' : ''}`;
    navigate(generatePath(pathTemplate, { publicKey }));
  }, [navigate, publicKey]);

  return (
    <Row>
      <Text className="gray">Max price slippage</Text>
      <Text>
        {viewModel.slippage * 100}% <PenIcon name="pen" onClick={handleShowSettings} />
      </Text>
    </Row>
  );
};
