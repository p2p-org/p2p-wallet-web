import type { FC } from 'react';
import { useCallback } from 'react';
import { generatePath, useHistory, useParams } from 'react-router';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';
import { Row, Text } from 'components/ui/AccordionDetails/common';
import type { SwapViewModel } from 'new/scenes/Main/Swap';
import type { SwapRouteParams } from 'new/scenes/Main/Swap/Swap/types';

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
  const history = useHistory();
  const { symbol } = useParams<SwapRouteParams>();

  const handleShowSettings = useCallback(() => {
    history.push(generatePath('/swap/settings/:symbol?', { symbol }));
  }, [history, symbol]);

  return (
    <Row>
      <Text className="gray">Max price slippage</Text>
      <Text>
        {viewModel.slippage * 100}% <PenIcon name="pen" onClick={handleShowSettings} />
      </Text>
    </Row>
  );
};