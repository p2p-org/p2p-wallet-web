import { FC, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useIntercom } from 'react-use-intercom';

export const Intercom: FC = () => {
  const { update } = useIntercom();
  const location = useLocation();

  useEffect(() => {
    update();
  }, [update, location]);

  return null;
};
