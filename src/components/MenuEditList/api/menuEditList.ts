import { EnumTarget, IAppIcon, IUser } from 'react-cms';
import { ThunkAction } from 'redux-thunk';
import { Action, Dispatch } from 'redux';
import { notification } from 'antd';
import { get } from 'lodash';

import Transport from '../../../service/Transport/Transport';
import { IReducers } from '../../../redux';
import { EDIT_ENUM, GET_APP_ICONS, SORT_UPDATE_MENUS, UPDATE_MENUS } from '../../../redux/common/common.constants';
import { CommonApi } from '../../../redux/common/common.api';
import { setIcons, setMenuData } from '../../../redux/common/common.reducer';

export class MenuEditListApi {
  public static updateMenu = (id: number, key: string, value: string): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;
        
        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
        });
        const response: Response  = await Transport.put(UPDATE_MENUS, headers, { id, [key]: value });
        const json: { code: number; req: string; } = await response.json();

        if (json.code !== 200) {
          throw new Error('No changes');
        }

        notification.success({message: 'Успешно обновлено', description: `Поле: ${key}\nЗначение: ${value}`});
      } catch (e) {
        notification.error({message: 'Не удалось изменить', description: 'Попробуйте еще раз'});
      }
      
      dispatch(CommonApi.getMenu());
    };
  };
  
  public static updateSort = (sortData: { [key: string]: number; }): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;
        
        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
          order: JSON.stringify(sortData),
        });
        await Transport.post(SORT_UPDATE_MENUS, headers);
      } catch (e) {
        notification.error({message: 'Не удалось изменить сортировку', description: 'Попробуйте еще раз'});
      }

      dispatch(CommonApi.getMenu());
    };
  };
  
  public static removeMenu = (id: number): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;
        
        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
          id: id.toString(),
        });
        await Transport.delete(UPDATE_MENUS, headers);
      } catch (e) {
        notification.error({message: 'Не удалось удалить меню', description: 'Попробуйте еще раз'});
      }

      dispatch(CommonApi.getMenu());
    };
  };
  
  public static addMenu = (menu: object): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;
        
        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
        });
        await Transport.post(UPDATE_MENUS, headers, menu);
        notification.success({message: `Меню успешно добавлено`, description: `Меню: "${get(menu, 'name', '')}"`});
      } catch (e) {
        notification.error({message: 'Не удалось добавить меню', description: 'Попробуйте еще раз'});
      }

      dispatch(CommonApi.getMenu());
    };
  };
  
  public static getIcons = (): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;
        
        const headers: Headers = new Headers({authorization: `Bearer ${token}`});
        const response: Response = await Transport.post(GET_APP_ICONS, headers);
        const icons: { code: number; data: IAppIcon[] } = await  response.json();
  
        dispatch(setIcons({data: icons.data}));
      } catch (e) {
        notification.error({message: 'Не удалось получить иконки', description: 'Попробуйте еще раз'});
      }
    };
  };

  public static getMenuData = (enumTarget: EnumTarget): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;

        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
        });
        const response: Response = await Transport.get(`${EDIT_ENUM}?id=-1&enumTarget=${enumTarget}`, headers);
        const json: { code: number; data: any[] } = await  response.json();

        dispatch(setMenuData({data: json.data, key: enumTarget}));
      } catch (e) {
        notification.error({message: 'Не удалось получить данные', description: 'Попробуйте еще раз'});
      }
    };
  };
}
