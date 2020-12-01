import { Action } from '@reduxjs/toolkit';
import { any } from 'ramda';

interface AnyAction extends Action<string> {
  // Allows any extra properties to be defined in an action.
  [extraProps: string]: any;
}

interface RejectedAction extends Action {
  error: Error;
}

const ignoredActions = [
  // since we cannot reliably tell when a wallet connection
  // action is rejected (e.g if the user just closes the wallet window)
  // we do not want to wait for this pending event, therefore it does not
  // enable the "loading" view, and we can trigger it multiple times if needed.
  'wallet/connect',
];

const isIgnored = (action: AnyAction) =>
  any((actionPrefix) => action.type.startsWith(actionPrefix), ignoredActions);

export const isRejectedAction = (action: AnyAction): action is RejectedAction =>
  action.type.endsWith('rejected') && !isIgnored(action);

export const isFulfilledAction = (action: AnyAction): action is AnyAction =>
  action.type.endsWith('fulfilled') && !isIgnored(action);

export const isPendingAction = (action: AnyAction): action is AnyAction =>
  action.type.endsWith('pending') && !isIgnored(action);
