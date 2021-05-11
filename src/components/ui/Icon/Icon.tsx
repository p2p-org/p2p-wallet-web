import React, { FC } from 'react';

import isPropValid from '@emotion/is-prop-valid';
import { CSSProperties } from '@linaria/core';

import arrowTriangle from './assets/arrow-triangle-icon.svg';
import attention from './assets/attention-icon.svg';
import bottom from './assets/bottom-icon.svg';
import branch from './assets/branch-icon.svg';
import bucket from './assets/bucket-icon.svg';
import card from './assets/card-icon.svg';
import chain from './assets/chain-icon.svg';
import change from './assets/change-icon.svg';
import checkmark from './assets/checkmark-icon.svg';
import chevron1 from './assets/chevron-1-icon.svg';
import chevron from './assets/chevron-icon.svg';
import clock from './assets/clock-icon.svg';
import close from './assets/close-icon.svg';
import copy from './assets/copy-icon.svg';
import currency from './assets/currency-icon.svg';
import db from './assets/db-icon.svg';
import error from './assets/error-icon.svg';
import eye from './assets/eye-icon.svg';
import freeTx from './assets/free-tx-icon.svg';
import gear from './assets/gear-icon.svg';
import hide from './assets/hide-icon.svg';
import home from './assets/home-icon.svg';
import lock from './assets/lock-icon.svg';
import logout from './assets/logout-icon.svg';
import more from './assets/more-icon.svg';
import pen from './assets/pen-icon.svg';
import plug from './assets/plug-icon.svg';
import plus from './assets/plus-icon.svg';
import qr from './assets/qr-icon.svg';
import reload from './assets/reload-icon.svg';
import search from './assets/search-icon.svg';
import settings from './assets/settings-icon.svg';
import success from './assets/success-icon.svg';
import sun from './assets/sun-icon.svg';
import swap from './assets/swap-icon.svg';
import timer from './assets/timer-icon.svg';
import top from './assets/top-icon.svg';
import wallet from './assets/wallet-icon.svg';
import warning from './assets/warning-icon.svg';

const iconsMap = new Map<string, string>([
  ['arrow-triangle', arrowTriangle],
  ['bottom', bottom],
  ['branch', branch],
  ['card', card],
  ['chain', chain],
  ['change', change],
  ['checkmark', checkmark],
  ['chevron-1', chevron1],
  ['chevron', chevron],
  ['close', close],
  ['copy', copy],
  ['currency', currency],
  ['db', db],
  ['bucket', bucket],
  ['gear', gear],
  ['more', more],
  ['eye', eye],
  ['search', search],
  ['settings', settings],
  ['success', success],
  ['sun', sun],
  ['swap', swap],
  ['timer', timer],
  ['home', home],
  ['hide', hide],
  ['lock', lock],
  ['logout', logout],
  ['pen', pen],
  ['plug', plug],
  ['plus', plus],
  ['qr', qr],
  ['reload', reload],
  ['top', top],
  ['wallet', wallet],
  ['warning', warning],
  ['error', error],
  ['attention', attention],
  ['clock', clock],
  ['free-tx', freeTx],
]);

export type Props = {
  name: string;
  size?: string | number;
  height?: string | number;
  width?: string | number;
  style?: CSSProperties;
  className?: string;
};

export const Icon: FC<Props> = ({ name, size, height, width, ...props }) => {
  const validProps: {
    [prop: string]: never;
  } = {};

  Object.keys(props).forEach((prop) => {
    if (isPropValid(prop)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      validProps[prop] = props[prop];
    }
  });

  const icon = iconsMap.get(name) as BrowserSpriteSymbol | undefined;

  if (!icon) {
    return null;
  }

  return (
    <svg {...validProps} viewBox={icon.viewBox} height={size || height} width={size || width}>
      <use xlinkHref={`#${icon.id}`} />
    </svg>
  );
};
