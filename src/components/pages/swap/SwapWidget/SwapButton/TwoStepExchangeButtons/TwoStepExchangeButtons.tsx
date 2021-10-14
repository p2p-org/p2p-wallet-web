import React, { FC } from 'react';

import { styled } from '@linaria/react';

import {
  ButtonState,
  stepOneLoadingStates,
  stepOneStates,
  stepTwoLoadingStates,
  stepTwoStates,
} from 'app/contexts/swap';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { Button } from 'components/ui';

const LoaderBlockStyled = styled(LoaderBlock)`
  margin-right: 8px;
`;

interface Props {
  onClickSetup?: () => void;
  onClickExchange?: () => void;
  buttonState: ButtonState;
}

export const TwoStepExchangeButtons: FC<Props> = ({
  onClickSetup = () => {},
  onClickExchange = () => {},
  buttonState,
}) => {
  const isStepOne = stepOneStates.includes(buttonState);
  const isStepOneRetry = buttonState === ButtonState.TwoTransactionsRetryStepOne;
  const isStepOneLoading = stepOneLoadingStates.includes(buttonState);

  const isStepTwo = stepTwoStates.includes(buttonState);
  const isStepTwoRetry = buttonState === ButtonState.TwoTransactionsRetryStepTwo;
  const isStepTwoLoading = stepTwoLoadingStates.includes(buttonState);

  if (isStepOne) {
    return (
      <Button primary big full disabled={isStepOneLoading} onClick={onClickSetup}>
        {isStepOneLoading && <LoaderBlockStyled />}
        {isStepOneRetry ? 'Retry' : 'Create token accounts'}
      </Button>
    );
  }

  if (isStepTwo) {
    return (
      <Button primary big full disabled={isStepTwoLoading} onClick={onClickExchange}>
        {isStepTwoLoading && <LoaderBlockStyled />}
        {isStepTwoRetry ? 'Retry' : 'Swap'}
      </Button>
    );
  }

  return null;
};
