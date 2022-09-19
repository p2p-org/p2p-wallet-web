import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Row, Text } from 'components/ui/AccordionDetails/common';

import type { ConfirmSwapModalViewModel } from '../../ConfirmSwapModal.ViewModel';

interface Props {
  viewModel: Readonly<ConfirmSwapModalViewModel>;
}

export const SlippageView: FC<Props> = observer(({ viewModel }) => {
  return (
    <Row>
      <Text className="gray">Max price slippage</Text>
      <Text>{viewModel.slippage * 100}%</Text>
    </Row>
  );
});
