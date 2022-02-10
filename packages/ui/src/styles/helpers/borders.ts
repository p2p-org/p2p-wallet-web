import { theme } from '../themes';

const primaryRGBA = `
  border: 1px solid rgba(${theme.colors.stroke.primaryRGB}, 0.3);
`;

const secondary = `
  border: 1px solid ${theme.colors.stroke.secondary};
`;

const linksRGBA = `
  border: 1px solid rgba(${theme.colors.textIcon.linksRGB}, 0.3);
`;

export const borders = {
  primaryRGBA,
  secondary,
  linksRGBA,
};
