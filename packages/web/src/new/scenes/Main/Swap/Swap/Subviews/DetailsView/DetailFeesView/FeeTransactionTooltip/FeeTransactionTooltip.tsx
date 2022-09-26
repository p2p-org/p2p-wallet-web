import type { FC } from 'react';

import { styled } from '@linaria/react';

import { LaagTooltip } from 'components/ui';
import type { PayingFeeInfo } from 'new/app/models/PayingFee';

const TooltipContent = styled.div`
  width: 300px;

  &.loader {
    padding: 50px 0;
  }
`;

interface Props {
  info: PayingFeeInfo;
}

export const FeeTransactionTooltip: FC<Props> = ({ info }) => {
  const elContent = (
    <TooltipContent>
      <strong>{info.alertTitle}</strong>
      <div>{info.alertDescription}</div>
    </TooltipContent>
  );

  return <LaagTooltip withClose={true} elContent={elContent} />;
};
