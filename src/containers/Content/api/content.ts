import { INews, IUser } from 'react-cms';
import { ThunkAction } from 'redux-thunk';
import { Action, Dispatch } from 'redux';
import { notification } from 'antd';
import { get } from 'lodash';

import Transport from '../../../service/Transport/Transport';
import { IReducers } from '../../../redux';
import { GET_CONTAINER, UPDATE_CONTAINER } from '../../../redux/common/common.constants';
import { setContainerData } from '../../../redux/common/common.reducer';

export class ContentAPI {
  public static getContainer = (id: number): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        dispatch(setContainerData({ isLoading: true }));
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;

        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
          container: id.toString(),
        });

        return Transport.post(GET_CONTAINER, headers)
          .then(async (response: Response) => {
            const json = await response.json();
            if (json.code !== 200) {
              return null;
            }
            dispatch(setContainerData({ id, data: json.data, module: json.module }));
            dispatch(setContainerData({ isLoading: false }));

            return json;
          })
          .catch(() => notification.error({ message: 'Не удалось получить контейнер', description: 'Попробуйте еще раз' }));
      } catch (e) {
        notification.error({ message: 'Не удалось получить контейнер', description: 'Попробуйте еще раз' });
      }

      dispatch(setContainerData({ isLoading: false }));
    };
  };

  public static updateContainer = (id: number, action: string, data: any, cb?: () => void): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;

        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
          container: id.toString(),
          action,
        });

        const body: object = {
          ...data, 
          action,          
        };
        console.log('body:', body);

        const response: Response = await Transport[data.id ? 'put' : 'post'](UPDATE_CONTAINER, headers, body);
        const json: { code: number; data?: { code?: string; error_text?: string; }; error_text?: string; } = await response.json();
        console.log(json);

        if (json.code !== 200 || !!json.error_text || !!get(json, 'data.error_text', false)) {
          throw new Error('Не удалось');
        }

        notification.success({ message: `Контейнер успешно обновлен`, description: '' });
        dispatch(ContentAPI.getContainer(id));

        if (cb) {
          cb();
        }
      } catch (e) {
        notification.error({ message: 'Не удалось обновить контейнер', description: 'Попробуйте еще раз' });
      }
    };
  };

  public static updatePoll = (id: number, action: string, data: any, cb?: () => void): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;

        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
          container: id.toString(),
          action, 
        });

        const body: object = {
          ...data, 
          action,          
        };

        console.log(body);
        
        const response: Response = await Transport.post(UPDATE_CONTAINER, headers, body);

        const json: { code: number; data?: { code?: string; error_text?: string; }; error_text?: string; } = await response.json();
        console.log(json);

        if (json.code !== 200) {
          throw new Error('Не удалось');
        }
  
        notification.success({message: `Контейнер успешно обновлен`, description: ''});
        dispatch(ContentAPI.getContainer(36));

        if (cb) {
          cb();
        }
      } catch (e) {
        notification.error({message: 'Не удалось обновить контейнер', description: 'Попробуйте еще раз'});
      }
    };
  };
}
