import type { FC } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useIntercom } from 'react-use-intercom';

import { useIsMobile } from '@p2p-wallet-web/ui';

export const Intercom: FC = () => {
  const { update } = useIntercom();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    update();
  }, [update, location]);

  useEffect(() => {
    update({
      hideDefaultLauncher: isMobile ? true : false,
    });
  }, [isMobile, update]);

  return null;
};
