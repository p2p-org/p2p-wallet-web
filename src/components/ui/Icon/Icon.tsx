import React, { FunctionComponent } from 'react';

import isPropValid from '@emotion/is-prop-valid';

import arrowAngle from './assets/arrow-angle-icon.svg';
import arrowTriangle from './assets/arrow-triangle-icon.svg';
import chevron1 from './assets/chevron-1-icon.svg';
import chevron from './assets/chevron-icon.svg';
import close from './assets/close-icon.svg';
import copy from './assets/copy-icon.svg';
import eye from './assets/eye-icon.svg';
import search from './assets/search-icon.svg';
import success from './assets/success-icon.svg';
import warning from './assets/warning-icon.svg';

export type SvgIconType = {
  viewBox: string;
  id: string;
};

const iconsMap = new Map<string, SvgIconType>([
  ['arrow-angle', arrowAngle],
  ['arrow-triangle', arrowTriangle],
  ['chevron-1', chevron1],
  ['chevron', chevron],
  ['close', close],
  ['copy', copy],
  ['eye', eye],
  ['search', search],
  ['success', success],
  ['warning', warning],
]);

export type IconType = {
  name: string;
  size?: string | number;
  height?: string | number;
  width?: string | number;
  style?: CSSStyleDeclaration;
};

export const Icon: FunctionComponent<IconType> = ({ name, size, height, width, ...props }) => {
  const validProps: {
    [prop: string]: any;
  } = {};

  Object.keys(props).forEach((prop) => {
    if (isPropValid(prop)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      validProps[prop] = props[prop];
    }
  });

  const icon = iconsMap.get(name);

  if (!icon) {
    return null;
  }

  return (
    <svg {...validProps} viewBox={icon.viewBox} height={size || height} width={size || width}>
      <use xlinkHref={`#${icon.id}`} />
    </svg>
  );
};
