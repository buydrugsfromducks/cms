import { Action, createAction, handleActions } from 'redux-actions';
import { IAppMenu, IUser } from 'react-cms';
import { PATHS } from '../../routes';

type ActionTypes =
  | boolean
  | IUser
  | IEventData
  | IAppMenu
  | ISetUserAction
  | IStatus;

interface ISetUserAction {
  token: string;
  user: IUser;
}

export interface IEventData {
  id: number;
  name: string;
  timeShift: number;
}

export interface IAuth {
  token: null | string;
  user: IUser;
  loading: boolean;
  path: string;
  login: string;
  pw: string;
  client?: string;
  code: number;
}

export interface ILogin {
  login: string;
  pw: string;
  client?: string;
}

export interface IStatus {
  code: number;
}

const PREFIX: string = 'auth';
const defaultState: IAuth = {
  token: null,
  user: null,
  loading: true,
  path: PATHS.CONTENT,
  login: '',
  pw: '',
  code: 0,
  client: 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
};

export const setUser = createAction<ISetUserAction>(`@@${PREFIX}/SET_USER`);
export const login = createAction(`@@${PREFIX}/LOGIN`);
export const logout = createAction(`@@${PREFIX}/LOGOUT`);
export const toggleLoader = createAction<boolean>(`@@${PREFIX}/TOGGLE_LOADER`);
export const setTokenToLS = createAction(`@@${PREFIX}/SET_TOKEN_TO_LS`);
export const updateEvent = createAction<IEventData>(`@@${PREFIX}/UPDATE_EVENT`);
export const setMenu = createAction<IAppMenu>(`@@${PREFIX}/SET_MENU`);

export const setStatus = createAction<IStatus>(`@@${PREFIX}/SET_Status`);

export default handleActions<IAuth, ActionTypes>({
  [setStatus.toString()]: (state: IAuth, action: Action<IStatus>): IAuth => ({
    ...state,
    code: action.payload.code,
  }),
  [setUser.toString()]: (state: IAuth, action: Action<ISetUserAction>): IAuth => ({
    ...state,
    user: action.payload.user,
    token: action.payload.token,
  }),
  [login.toString()]: (state: IAuth, action: Action<any>): IAuth => ({
    ...state,
    login: '',
    pw: '',
  }),
  [logout.toString()]: (state: IAuth): IAuth => ({
    ...state,
    user: null,
    loading: false,
    token: '',
    path: state.path,
  }),
  [toggleLoader.toString()]: (state: IAuth, action: Action<boolean>): IAuth => ({
    ...state,
    loading: action.payload,
  }),
  [setMenu.toString()]: (state: IAuth, action: Action<IAppMenu>): IAuth => ({
    ...state,
    path: action.payload.menuPath,
  }),
  [updateEvent.toString()]: (state: IAuth, action: Action<IEventData>): IAuth => ({
    ...state,
    user: {
      ...state.user,
      appdata: {
        ...state.user.appdata,
        eventName: action.payload.name,
        eventID: action.payload.id,
        eventTimeShift: action.payload.timeShift,
      },
    },
  }),
}, defaultState);
