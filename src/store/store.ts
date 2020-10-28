import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';

import { solanaApiMiddleware } from './middlewares';
import { rootReducer } from './reducers';

const middlewares = [thunkMiddleware, solanaApiMiddleware()];

export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(...middlewares)));
