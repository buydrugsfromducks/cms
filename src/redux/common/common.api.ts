import { IMenu, IModule, IUser } from 'react-cms';
import { ThunkAction } from 'redux-thunk';
import { Action, Dispatch } from 'redux';
import { notification } from 'antd';

import { setMenu, setModule } from './common.reducer';
import { GET_MENUS, GET_MODULES } from './common.constants';
import { IReducers } from '../index';
import Transport from '../../service/Transport/Transport';

export class CommonApi {
  public static getModules = (): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;
  
        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
        });
        const response: Response = await Transport.get(GET_MODULES, headers);
        const json: { code: number, data: IModule[] } = await response.json();
  
        dispatch(setModule({data: json.data}));
      } catch (e) {
        CommonApi.getError('модули');
      }
    };
  };
  
  public static getMenu = (): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;
  
        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
        });
        const response: Response = await Transport.get(GET_MENUS, headers);
        const json: { code: number, containers: IMenu[] } = await response.json();

        if (json.code > 200) {
          dispatch(setMenu({data: [], isOk: false}));
          return;
        }

        dispatch(setMenu({data: json.containers, isOk: true}));
      } catch (e) {
        dispatch(setMenu({data: [], isOk: false}));
        CommonApi.getError('меню');
      }
    };
  };
  
  protected static getError = (theme?: string) => notification.error({message: `Не удалось получить ${theme}`, description: 'Попробуйте еще раз'});
}
