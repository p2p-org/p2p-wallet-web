import type { FC } from 'react';

import { styled } from '@linaria/react';

import { LaagTooltip } from 'components/ui';

const TooltipContent = styled.div`
  max-width: 298px;
  height: 65px;
`;

interface Props {
  className?: string;
}

export const AccountCreationFeeTooltip: FC<Props> = ({ className }) => {
  return (
    <LaagTooltip
      withClose={true}
      elContent={
        <TooltipContent>
          This value is calculated by subtracting the account creation fee from your balance
        </TooltipContent>
      }
      className={className}
    />
  );
};
