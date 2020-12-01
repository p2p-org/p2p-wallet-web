import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { modalsMiddleware } from 'redux-modals-manager';

import { isDev } from 'config/constants';

import { rootReducer } from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  // add middlewares via a callback, as recommended
  // here: https://redux-toolkit.js.org/api/configureStore#middleware
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    modalsMiddleware,
    logger, // Note: logger must be the last middleware in chain, otherwise it will log thunk and promise, not actual actions
  ],
  devTools: isDev,
});

export type AppDispatch = typeof store.dispatch;
