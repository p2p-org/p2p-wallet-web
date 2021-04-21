import { useEffect, useState } from 'react';

const breakpoints: { [type: string]: number } = {
  widedesktop: 1440,
  desktop: 1440,
  tablet: 1024,
  mobileLandscape: 568,
  mobile: 320,
};

export const between = (breakStart: string, breakEnd: string) =>
  `@media (min-width: ${breakpoints[breakStart]}) and (max-width: ${breakpoints[breakEnd]})`;

export const down = {
  mobileLandscape: `@media (max-width: ${breakpoints.mobileLandscape}px)`,
  mobile: `@media (max-width: ${breakpoints.mobile}px)`,
};

export const up = {
  widedesktop: `@media (min-width: ${breakpoints.widedesktop}px)`,
  desktop: `@media (min-width: ${breakpoints.desktop}px)`,
  tablet: `@media (min-width: ${breakpoints.tablet}px)`,
  mobileLandscape: `@media (min-width: ${breakpoints.mobileLandscape}px)`,
};

// based on https://github.com/mg901/styled-breakpoints/blob/master/hooks/use-breakpoint.js
export const useBreakpoint = (breakpoint: string) => {
  // Get the media query to match
  const query = breakpoint.replace(/^@media\s*/, '');
  const [isBreak, setIsBreak] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsBreak(event.matches);
    };

    setIsBreak(mq.matches);

    // Safari < 14 can't use addEventListener on a MediaQueryList
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList#Browser_compatibility
    if (!mq.addEventListener) {
      // Update the state whenever the media query match state changes
      mq.addListener(handleChange);

      // Clean up on unmount and if the query changes
      return () => {
        mq.removeListener(handleChange);
      };
    }
    mq.addEventListener('change', handleChange);

    return () => {
      mq.removeEventListener('change', handleChange);
    };
  }, [query]);

  return isBreak;
};
