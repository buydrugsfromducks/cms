import { IAppsList, IUser } from 'react-cms';
import { ThunkAction } from 'redux-thunk';
import { Action, Dispatch } from 'redux';
import { notification } from 'antd';

import Transport from '../../../service/Transport/Transport';
import { IReducers } from '../../../redux';
import { APPS_LIST, SELECT_APPS, ADD_APP } from '../../../redux/common/common.constants';
import { setContainerData, setApps } from '../../../redux/common/common.reducer';

import { createBrowserHistory } from 'history';

import { PATHS } from '../../../routes';

export class AppsAPI {
  public static getApps = (): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        dispatch(setContainerData({isLoading: true}));
        const token: string = getStates().auth.token;

        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
        });

        const response: Response = await Transport.post(APPS_LIST, headers);
        
        const json: { code: number; data: IAppsList[] } = await response.json();
          
        dispatch(setApps({data: json.data}));
      } catch (e) {
        notification.error({message: 'Не удалось получить приложения', description: 'Попробуйте еще раз'});
      }
    };
  };

  public static newApp = (props: any): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;

        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
        });

        const body: any = {
          event_name: props.event_name,
          start_time: props.start_time,
          end_time: props.end_time,
          timezone: props.timezone,
          location: props.location,
        };

        const response: Response = await Transport.post(ADD_APP, headers, body);
        
        const json: { code: number; data: IAppsList[] } = await response.json();
        if(json.code === 200) {
          dispatch(AppsAPI.getApps());
        }

      } catch (e) {
        notification.error({message: 'Не удалось получить приложения', description: 'Попробуйте еще раз'});
      }
    };
  };

  public static selectApps = (props: any): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        const token: string = getStates().auth.token;

        console.log(props);

        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
        });

        const body: any = {
          id: props,
        };

        const response: Response = await Transport.post(SELECT_APPS, headers, body);
        
        const json: { code: number; data: IAppsList[] } = await response.json();
        console.log(json.code);
        if(json.code === 200) {
          createBrowserHistory({
            forceRefresh: true, //ls doesn't refresh page
          }).push(PATHS.CONTENT);
        }

      } catch (e) {
        notification.error({message: 'Не удалось получить приложения', description: 'Попробуйте еще раз'});
      }
    };
  };
}
