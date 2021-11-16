declare module 'redux-modals-manager' {
  import type { ComponentType } from 'react';
  import type { Middleware, Reducer } from 'redux';
  import type { Action } from '@reduxjs/toolkit';

  export type ModalComponentType<P = unknown> = ComponentType<P> & {
    canClose(): Promise<any>;
  };

  type ModalState = { type: string; modalId: string; props: any };

  type ModalsState = ModalState[];

  export const modalsReducer: Reducer<ModalsState>;

  export const modalsMiddleware: Middleware;

  export function closeModal(modalId: string, result?: any): Action;

  export function openModal(modalId: string, props?: any): Action;
}
