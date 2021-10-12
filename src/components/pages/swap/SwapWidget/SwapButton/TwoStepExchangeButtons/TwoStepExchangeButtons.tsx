import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { ButtonState, stepOneLoadingStates, stepTwoLoadingStates } from 'app/contexts/swap';
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
  const isStepOne = buttonState === ButtonState.TwoTransactionsStepOne;
  const isStepOneRetry = buttonState === ButtonState.TwoTransactionsRetryStepOne;
  const isStepOneLoading = stepOneLoadingStates.includes(buttonState);

  const isStepTwo = buttonState === ButtonState.TwoTransactionsStepTwo;
  const isStepTwoRetry = buttonState === ButtonState.TwoTransactionsRetryStepTwo;
  const isStepTwoLoading = stepTwoLoadingStates.includes(buttonState);

  if (isStepOne || isStepOneRetry || isStepOneLoading) {
    return (
      <Button primary big full disabled={isStepOneLoading} onClick={onClickSetup}>
        {isStepOneLoading && <LoaderBlockStyled />}
        {isStepOneRetry ? 'Retry' : 'Create token accounts'}
      </Button>
    );
  }

  if (isStepTwo || isStepTwoRetry || isStepTwoLoading) {
    return (
      <Button primary big full disabled={isStepTwoLoading} onClick={onClickExchange}>
        {isStepTwoLoading && <LoaderBlockStyled />}
        {isStepTwoRetry ? 'Retry' : 'Swap'}
      </Button>
    );
  }

  return null;
};
