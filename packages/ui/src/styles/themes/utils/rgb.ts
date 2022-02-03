import { parseToRgb } from "polished";

export const toRGB = (hex: string): string => {
  const color = parseToRgb(hex);
  return [color.red, color.green, color.blue].join(',');
}
