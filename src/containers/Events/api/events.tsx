import { IEvent, IUser } from 'react-cms';
import { ThunkAction } from 'redux-thunk';
import { Action, Dispatch } from 'redux';
import { notification } from 'antd';

import Transport from '../../../service/Transport/Transport';
import { IReducers } from '../../../redux';
import { GET_EVENTS } from '../../../redux/common/common.constants';
import { setContainerData, setEvents } from '../../../redux/common/common.reducer';
import { IEventData, updateEvent } from '../../../redux/auth/auth.reducer';

export class EventsAPI {
  public static getEvents = (): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        dispatch(setContainerData({isLoading: true}));
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;

        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
        });

        const response: Response = await Transport.get(GET_EVENTS, headers);
        const json: { code: number; events: IEvent[] } = await response.json();

        dispatch(setEvents({data: json.events}));
      } catch (e) {
        notification.error({message: 'Не удалось получить людей', description: 'Попробуйте еще раз'});
      }
    };
  };

  public static updateEvent = (event: IEventData): ThunkAction<void, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>) => {
      dispatch(updateEvent({name: event.name, id: event.id, timeShift: event.timeShift}));
      notification.success({message: 'Событие успешно изменено', description: ''});
    };
  };
}
