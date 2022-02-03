import type { FC } from 'react';

import { useBuyState } from 'app/contexts';
import { Button } from 'components/ui';

export const MoonpayButton: FC = () => {
  const { setIsShowIframe, error } = useBuyState();

  if (error) {
    return (
      <Button disabled primary full>
        {error}
      </Button>
    );
  }

  return (
    <Button primary full onClick={() => setIsShowIframe(true)}>
      Continue with Moonpay
    </Button>
  );
};
