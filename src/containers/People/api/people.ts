import { EnumTarget, EnumType, IPeople, IUser, UploadType } from 'react-cms';
import { ThunkAction } from 'redux-thunk';
import { Action, Dispatch } from 'redux';
import { notification } from 'antd';
import { get } from 'lodash';
import { UploadFile } from 'antd/lib/upload/interface';

import Transport from '../../../service/Transport/Transport';
import { IReducers } from '../../../redux';
import { GET_PEOPLE, EDIT_ENUM, CREATE_UPLOAD_SESSION, UPLOAD_IMAGE } from '../../../redux/common/common.constants';
import { setContainerData, setPeople } from '../../../redux/common/common.reducer';

export class PeopleAPI {
  public static getPeople = (): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        dispatch(setContainerData({isLoading: true}));
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;
        
        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
        });
        
        const response: Response = await Transport.post(GET_PEOPLE, headers);
        const json: { code: number; data: IPeople[] } = await response.json();
        
        dispatch(setPeople({data: json.data}));
      } catch (e) {
        notification.error({message: 'Не удалось получить людей', description: 'Попробуйте еще раз'});
      }

      dispatch(setContainerData({isLoading: false}));
    };
  };
  
  public static updateEnum = (id: number, enumType: EnumType, enumTarget: EnumTarget, data: object, cb?: () => void): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        dispatch(setContainerData({isLoading: true}));
        const token: string = getStates().auth.token;
        const user: IUser = getStates().auth.user;
        
        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
          event: user.appdata.eventID.toString(),
          id: id ? id.toString() : null,
        });
        const response: Response = await Transport.response(
          EDIT_ENUM,
          enumType,
          headers,
          {...data, id, enumTarget},
        );
        const json: { code: number; req: string; } = await response.json();

        if (json.code !== 200) {
          throw new Error('No changes');
        }
  
        notification.success({message: `Успешно обновлено`, description: ''});
      } catch (e) {
        notification.error({message: 'Не удалось обновить', description: 'Попробуйте еще раз'});
      }
  
      if (cb) {
        cb();
      }
    };
  };

  public static uploadImage = (data: UploadFile[], uploadType: UploadType, cb?: (url: string[]) => void): ThunkAction<Promise<void>, IReducers, Action> => {
    return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
      try {
        //'Access-Control-Allow-Origin': '*' delete in production version
        const token: string = getStates().auth.token;

        const headers: Headers = new Headers({
          authorization: `Bearer ${token}`,
        });

        const responseSession: Response = await Transport.post(`${CREATE_UPLOAD_SESSION}?target=${uploadType}`, headers);

        if (responseSession.ok) {
          const json: { code: number; url: string; } = await responseSession.json();
          const url: string = json.url;

          const formData: FormData = new FormData();
          // @ts-ignore
          data.forEach(item => formData.append('files[]', item));

          const responseUpload: Response = await Transport.post(
            url,
            headers,
            formData,
          );
          const uploadData: { code: number; data: { url: string; }[] } = await responseUpload.json();

          if (+uploadData.code === 200) {
            if (cb) {
              cb(uploadData.data.map(item => item.url));
            }
          } else {
            PeopleAPI.uploadErrorMessage();
          }
        } else {
          PeopleAPI.uploadErrorMessage();
        }
      } catch (e) {
        PeopleAPI.uploadErrorMessage();
      }
    };
  };

  protected static uploadErrorMessage = () => notification.error({message: 'Не удалось загрузить', description: 'Попробуйте еще раз'});
}
