import { combineReducers } from 'redux';

import auth, { IAuth } from './auth/auth.reducer';
import common, { ICommon } from './common/common.reducer';

export interface IReducers {
  auth: IAuth;
  common: ICommon;
}

export default combineReducers({
  common,
  auth,
});
