import type { FC } from 'react';

import { styled } from '@linaria/react';

import { useTrackEventOpen } from 'app/hooks/metrics';
import { LaagTooltip } from 'components/ui';

const TooltipContent = styled.div`
  max-width: 298px;
  height: 65px;
`;

export const AccountCreationFeeTooltip: FC = () => {
  useTrackEventOpen('Send_Max_Info_Showed');

  return (
    <LaagTooltip
      withClose={true}
      elContent={
        <TooltipContent>
          This value is calculated by subtracting the account creation fee from your balance
        </TooltipContent>
      }
    />
  );
};
