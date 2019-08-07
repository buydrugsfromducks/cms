import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

import rootReducer from '../redux/index';
import { TESTING_ENV } from '../service/Consts/Consts';

const isTesting: boolean = process.env.NODE_ENV === TESTING_ENV;

export function configureStore() {
  const logger = createLogger({collapsed: true});
  let middleware = isTesting ? applyMiddleware(thunk, logger) : applyMiddleware(thunk);

  if (process.env.NODE_ENV === 'development') {
    middleware = composeWithDevTools(middleware);
  }

  const store = createStore(rootReducer, middleware);
  store.dispatch({type: '@@redux/INIT'});

  if (module.hot) {
    module.hot.accept('../redux', () => {
      const nextReducer = require('../redux/index');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
