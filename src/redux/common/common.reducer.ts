import { Action, createAction, handleActions } from 'redux-actions';
import { IAppIcon, IContainer, IEvent, IMenu, IModule, IPeople, IAppsList, IFilesList } from 'react-cms';

type IAction<T> = { data: T[]; };

interface IMenuDataAction {
  data: any[];
  key: string;
}

export interface IMenuReducerType {
  data: IMenu[];
  isOk: boolean;
}

type ActionTypes =
  | IAction<IFilesList>
  | IAction<IAppsList>
  | IAction<IModule>
  | IAction<IAppIcon>
  | IMenuReducerType
  | IAction<IPeople>
  | IAction<IEvent>
  | IMenuDataAction
  | IContainer;

export interface ICommon {
  files: IFilesList[];
  apps: IAppsList[];
  modules: IModule[];
  menu: IMenuReducerType;
  icons: IAppIcon[];
  people: IPeople[];
  events: IEvent[];
  container: IContainer;
  menuData: { [key: string]: any[]; };
  currentEntity: any;
}

const PREFIX: string = 'common';
const defaultState: ICommon = {
  files: [],
  apps: [],
  modules: [],
  menu: { data: [], isOk: true },
  icons: [],
  people: [],
  events: [],
  container: {
    data: null,
    module: null,
    isLoading: false,
    id: null,
  },
  menuData: {},
  currentEntity: null,
};

export const setFiles = createAction<IAction<IFilesList>>(`@@${PREFIX}/SET_FILE`);

export const setModule = createAction<IAction<IModule>>(`@@${PREFIX}/SET_MODULE`);
export const setMenu = createAction<IMenuReducerType>(`@@${PREFIX}/SET_MENU`);
export const setIcons = createAction<IAction<IAppIcon>>(`@@${PREFIX}/SET_ICONS`);
export const setContainerData = createAction<Partial<IContainer>>(`@@${PREFIX}/SET_CONTAINER`);
export const setPeople = createAction<IAction<IPeople>>(`@@${PREFIX}/SET_PEOPLE`);
export const setEvents = createAction<IAction<IEvent>>(`@@${PREFIX}/SET_EVENTS`);
export const setMenuData = createAction<IMenuDataAction>(`@@${PREFIX}/SET_MENU_DATA`);
export const setCurrentEntity = createAction<any>(`@@${PREFIX}/SET_CURRENT_ENTITY`);

export const setApps = createAction<IAction<IAppsList>>(`@@${PREFIX}/SET_APPS`);

export default handleActions<ICommon, ActionTypes>({
  [setModule.toString()]: (state: ICommon, action: Action<IAction<IModule>>): ICommon => ({
    ...state,
    modules: action.payload.data,
  }),
  [setCurrentEntity.toString()]: (state: ICommon, action: Action<any>): ICommon => ({
    ...state,
    currentEntity: action.payload,
  }),
  [setMenu.toString()]: (state: ICommon, action: Action<IMenuReducerType>): ICommon => ({
    ...state,
    menu: action.payload,
  }),
  [setFiles.toString()]: (state: ICommon, action: Action<IFilesList>): ICommon => ({
    ...state,
    files: action.payload.data,
  }),
  [setIcons.toString()]: (state: ICommon, action: Action<IAction<IAppIcon>>): ICommon => ({
    ...state,
    icons: action.payload.data,
  }),
  [setContainerData.toString()]: (state: ICommon, action: Action<Partial<IContainer>>): ICommon => ({
    ...state,
    container: { ...state.container, ...action.payload },
  }),
  [setPeople.toString()]: (state: ICommon, action: Action<IAction<IPeople>>): ICommon => ({
    ...state,
    people: action.payload.data,
  }),
  [setEvents.toString()]: (state: ICommon, action: Action<IAction<IEvent>>): ICommon => ({
    ...state,
    events: action.payload.data,
  }),

  [setApps.toString()]: (state: ICommon, action: Action<IAction<IAppsList>>): ICommon => ({
    ...state,
    apps: action.payload.data,
  }),

  [setMenuData.toString()]: (state: ICommon, action: Action<IMenuDataAction>): ICommon => ({
    ...state,
    menuData: {
      ...state.menuData,
      [action.payload.key]: action.payload.data,
    },
  }),
}, defaultState);
