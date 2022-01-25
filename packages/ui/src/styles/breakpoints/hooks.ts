import { useMediaQuery } from 'react-responsive';

import { breakpoints } from './breakpoints';

export const useIsMobile = () => useMediaQuery({ maxWidth: breakpoints.tablet - 1 });

export const useIsSmall = () => useMediaQuery({ minWidth: breakpoints.small });

export const useIsTablet = () => useMediaQuery({ minWidth: breakpoints.tablet });

export const useIsDesktop = () => useMediaQuery({ minWidth: breakpoints.desktop });
