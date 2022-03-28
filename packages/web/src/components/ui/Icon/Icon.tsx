import type { FC, HTMLAttributes } from 'react';

import isPropValid from '@emotion/is-prop-valid';
import type { CSSProperties } from '@linaria/core';

import arrow from './assets/arrow-icon.svg';
import arrowTriangle from './assets/arrow-triangle-icon.svg';
import attention from './assets/attention-icon.svg';
import branch from './assets/branch-icon.svg';
import bucket from './assets/bucket-icon.svg';
import card from './assets/card-icon.svg';
import chain from './assets/chain-icon.svg';
import change from './assets/change-icon.svg';
import checkmark from './assets/checkmark-icon.svg';
import chevron1 from './assets/chevron-1-icon.svg';
import chevronRounded from './assets/chevron-rounded-icon.svg';
import close from './assets/close-icon.svg';
import currency from './assets/currency-icon.svg';
import db from './assets/db-icon.svg';
import error from './assets/error-icon.svg';
import freeTx from './assets/free-tx-icon.svg';
import lock from './assets/lock-icon.svg';
import logout from './assets/logout-icon.svg';
import more from './assets/more-icon.svg';
import appStore from './assets/new/app-store-icon.svg';
import arrowDown from './assets/new/arrow-down-icon.svg';
import arrowSwap from './assets/new/arrow-swap-icon.svg';
import bottom from './assets/new/bottom-icon.svg';
import caret from './assets/new/caret-icon.svg';
import check from './assets/new/check-icon.svg';
import chevron from './assets/new/chevron-icon.svg';
import clock from './assets/new/clock-icon.svg';
import copy from './assets/new/copy-icon.svg';
import cross from './assets/new/cross-icon.svg';
import external from './assets/new/external-icon.svg';
import eyeHide from './assets/new/eye-hide-icon.svg';
import eye from './assets/new/eye-icon.svg';
import gear from './assets/new/gear-icon.svg';
import googlePlay from './assets/new/google-play-icon.svg';
import info from './assets/new/info-icon.svg';
import kebab from './assets/new/kebab-icon.svg';
import pen from './assets/new/pen-icon.svg';
import plus from './assets/new/plus-icon.svg';
import qr from './assets/new/qr-icon.svg';
import question from './assets/new/question-icon.svg';
import roundStop from './assets/new/round-stop-icon.svg';
import search from './assets/new/search-icon.svg';
import sendMessage from './assets/new/send-message-icon.svg';
import storeIcon from './assets/new/store-icon.svg';
import swap from './assets/new/swap-icon.svg';
import top from './assets/new/top-icon.svg';
import wallet from './assets/new/wallet-icon.svg';
import warning from './assets/new/warning-icon.svg';
import oppositeArrows from './assets/opposite-arrows-icon.svg';
import plug from './assets/plug-icon.svg';
import questionCircle from './assets/question-circle-icon.svg';
import reload from './assets/reload-icon.svg';
import searchOld from './assets/search-icon.svg';
import settings from './assets/settings-icon.svg';
import success from './assets/success-icon.svg';
import sun from './assets/sun-icon.svg';
import timer from './assets/timer-icon.svg';
import walletOld from './assets/wallet-icon.svg';

const iconsMap = new Map<string, string>([
  ['arrow', arrow],
  ['app-store', appStore],
  ['arrow-triangle', arrowTriangle],
  ['bottom', bottom],
  ['caret', caret],
  ['check', check],
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
  ['cross', cross],
  ['currency', currency],
  ['db', db],
  ['bucket', bucket],
  ['gear', gear],
  ['google-play', googlePlay],
  ['info', info],
  ['more', more],
  ['arrow-down', arrowDown],
  ['eye-hide', eyeHide],
  ['eye', eye],
  ['external', external],
  ['search', search],
  ['send-message', sendMessage],
  ['search-old', searchOld],
  ['settings', settings],
  ['success', success],
  ['sun', sun],
  ['swap', swap],
  ['timer', timer],
  ['wallet', wallet],
  ['lock', lock],
  ['logout', logout],
  ['pen', pen],
  ['plug', plug],
  ['plus', plus],
  ['qr', qr],
  ['question', question],
  ['round-stop', roundStop],
  ['question-circle', questionCircle],
  ['reload', reload],
  ['top', top],
  ['wallet-old', walletOld],
  ['warning', warning],
  ['error', error],
  ['attention', attention],
  ['clock', clock],
  ['free-tx', freeTx],
  ['kebab', kebab],
  ['opposite-arrows', oppositeArrows],
  ['store-icon', storeIcon],
  ['arrow-swap', arrowSwap],
]);

interface Props extends HTMLAttributes<HTMLOrSVGElement> {
  name: string;
  size?: string | number;
  height?: string | number;
  width?: string | number;
  style?: CSSProperties;
  className?: string;
}

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
      {...props}
    >
      <use xlinkHref={`#${icon.id}`} />
    </svg>
  );
};
