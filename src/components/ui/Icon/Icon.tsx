// eslint-disable-next-line simple-import-sort/sort
import React, { FC } from 'react';

import isPropValid from '@emotion/is-prop-valid';
import { CSSProperties } from '@linaria/core';

import arrow from './assets/arrow-icon.svg';
import appStore from './assets/new/app-store-icon.svg';
import arrowTriangle from './assets/arrow-triangle-icon.svg';
import attention from './assets/attention-icon.svg';
import bottom from './assets/new/bottom-icon.svg';
import branch from './assets/branch-icon.svg';
import bucket from './assets/bucket-icon.svg';
import card from './assets/card-icon.svg';
import chain from './assets/chain-icon.svg';
import change from './assets/change-icon.svg';
import checkmark from './assets/checkmark-icon.svg';
import chevron1 from './assets/chevron-1-icon.svg';
import chevron from './assets/chevron-icon.svg';
import chevronRounded from './assets/chevron-rounded-icon.svg';
import clock from './assets/clock-icon.svg';
import close from './assets/close-icon.svg';
import copy from './assets/copy-icon.svg';
import currency from './assets/currency-icon.svg';
import db from './assets/db-icon.svg';
import error from './assets/error-icon.svg';
import eyeHide from './assets/eye-hide-icon.svg';
import eye from './assets/eye-icon.svg';
import freeTx from './assets/free-tx-icon.svg';
import gear from './assets/new/gear-icon.svg';
import googlePlay from './assets/new/google-play-icon.svg';
import home from './assets/new/home-icon.svg';
import info from './assets/info-icon.svg';
import lock from './assets/lock-icon.svg';
import logout from './assets/logout-icon.svg';
import more from './assets/more-icon.svg';
import pen from './assets/pen-icon.svg';
import plug from './assets/plug-icon.svg';
import plus from './assets/new/plus-icon.svg';
import qr from './assets/qr-icon.svg';
import questionCircle from './assets/question-circle-icon.svg';
import reload from './assets/reload-icon.svg';
import search from './assets/search-icon.svg';
import settings from './assets/settings-icon.svg';
import success from './assets/success-icon.svg';
import sun from './assets/sun-icon.svg';
import swap from './assets/new/swap-icon.svg';
import timer from './assets/timer-icon.svg';
import top from './assets/new/top-icon.svg';
import wallet from './assets/wallet-icon.svg';
import warning from './assets/warning-icon.svg';

const iconsMap = new Map<string, string>([
  ['arrow', arrow],
  ['app-store', appStore],
  ['arrow-triangle', arrowTriangle],
  ['bottom', bottom],
  ['branch', branch],
  ['card', card],
  ['chain', chain],
  ['change', change],
  ['checkmark', checkmark],
  ['chevron-1', chevron1],
  ['chevron', chevron],
  ['chevron-rounded', chevronRounded],
  ['close', close],
  ['copy', copy],
  ['currency', currency],
  ['db', db],
  ['bucket', bucket],
  ['gear', gear],
  ['google-play', googlePlay],
  ['more', more],
  ['eye-hide', eyeHide],
  ['eye', eye],
  ['search', search],
  ['settings', settings],
  ['success', success],
  ['sun', sun],
  ['swap', swap],
  ['timer', timer],
  ['home', home],
  ['lock', lock],
  ['logout', logout],
  ['pen', pen],
  ['plug', plug],
  ['plus', plus],
  ['qr', qr],
  ['question-circle', questionCircle],
  ['reload', reload],
  ['top', top],
  ['wallet', wallet],
  ['warning', warning],
  ['error', error],
  ['attention', attention],
  ['clock', clock],
  ['free-tx', freeTx],
  ['info', info],
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
      // @ts-ignore
      validProps[prop] = props[prop];
    }
  });

  const icon = iconsMap.get(name) as BrowserSpriteSymbol | undefined;

  if (!icon) {
    return null;
  }

  return (
    <svg
      {...validProps}
      viewBox={icon.viewBox}
      height={size || height}
      width={size || width}
      {...props}>
      <use xlinkHref={`#${icon.id}`} />
    </svg>
  );
};
