import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { modalsMiddleware } from 'redux-modals-manager';
import thunkMiddleware from 'redux-thunk';

import { solanaApiMiddleware } from './middlewares';
import { rootReducer } from './reducers';

const middlewares = [thunkMiddleware, solanaApiMiddleware(), modalsMiddleware];

export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(...middlewares)));
