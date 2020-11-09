import React, { FunctionComponent } from 'react';

import isPropValid from '@emotion/is-prop-valid';

import chevron from './assets/chevron-icon.svg';
import close from './assets/close-icon.svg';
import copy from './assets/copy-icon.svg';

const iconsMap = new Map<string, string>([
  ['close', close],
  ['chevron', chevron],
  ['copy', copy],
]);

type Props = {
  name: string;
  size?: string | number;
  height?: string | number;
  width?: string | number;
};

export const Icon: FunctionComponent<Props> = ({ name, size, height, width, ...props }) => {
  const validProps: {
    [prop: string]: any;
  } = {};

  Object.keys(props).forEach((prop) => {
    if (isPropValid(prop)) {
      validProps[prop] = props[prop];
    }
  });

  return (
    <svg {...validProps} height={size || height} width={size || width}>
      <use xlinkHref={iconsMap.get(name)} />
    </svg>
  );
};
