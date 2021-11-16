export const breakpoints = {
  small: 440,
  tablet: 600,
  desktop: 836,
};

export const up = {
  small: `@media (min-width: ${breakpoints.small}px)`,
  tablet: `@media (min-width: ${breakpoints.tablet}px)`,
  desktop: `@media (min-width: ${breakpoints.desktop}px)`,
};
