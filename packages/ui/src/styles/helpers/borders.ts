import { theme } from '../themes';

const primary = `
  border: 0.5px solid ${theme.colors.stroke.primary};
`;

const secondary = `
  border: 1px solid ${theme.colors.stroke.secondary};
`;

const links = `
  border: 0.5px solid ${theme.colors.textIcon.links};
`;

export const borders = {
  primary,
  secondary,
  links,
};
