import { IEvent, IUser, IFilesList, UploadType } from 'react-cms';
import { ThunkAction } from 'redux-thunk';
import { Action, Dispatch } from 'redux';
import { notification } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';

import Transport from '../../../service/Transport/Transport';
import { IReducers } from '../../../redux';
import { GET_FILES, CREATE_UPLOAD_SESSION } from '../../../redux/common/common.constants';
import { setContainerData, setEvents, setFiles } from '../../../redux/common/common.reducer';
import { IEventData, updateEvent } from '../../../redux/auth/auth.reducer';

export class FilesAPI {
	public static getData = (): ThunkAction<Promise<void>, IReducers, Action> => {
		return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<any> => {
			try {
				dispatch(setContainerData({ isLoading: true }));
				const token: string = getStates().auth.token;
				const user: IUser = getStates().auth.user;

				const headers: Headers = new Headers({
					authorization: `Bearer ${token}`,
					event: user.appdata.eventID.toString(),
				});

				const body: object = {
					action: 'list',
					target: 'company',
				};

				const response: Response = await Transport.post(GET_FILES, headers, body);
				const json: { code: number; data: IFilesList[] } = await response.json();
				console.log(json);

				dispatch(setFiles({ data: json.data }));
				return json;
			} catch (e) {
				notification.error({ message: 'Не удалось получить никого', description: e });
			}
		};
	};

	public static updateFile = (event: IFilesList): ThunkAction<void, IReducers, Action> => {
		return async (dispatch: Dispatch<IReducers>) => {
			console.log(event);
			dispatch(FilesAPI.getData());
			notification.success({ message: 'Событие успешно изменено', description: '' });
		};
	};

	public static uploadImage = (data: UploadFile[], uploadType: UploadType, cb?: (url: string[]) => void): ThunkAction<Promise<void>, IReducers, Action> => {
		return async (dispatch: Dispatch<IReducers>, getStates: () => IReducers): Promise<void> => {
			try {
				//'Access-Control-Allow-Origin': '*' delete in production version
				const token: string = getStates().auth.token;
				const user: IUser = getStates().auth.user;

				const headers: Headers = new Headers({
					authorization: `Bearer ${token}`,
				});

				const responseSession: Response = await Transport.post(`${CREATE_UPLOAD_SESSION}?target=${uploadType}`, headers);

				if (responseSession.ok) {
					const json: { code: number; url: string; } = await responseSession.json();
					const url: string = json.url;

					console.log(data);
					
					const formData: FormData = new FormData();
					
					/**FIXME
					 * Type @any, because UploadFile cannot be in append method
					 * data.forEach((item: UploadFile) => formData.append('files[]', item.toString()))
					 * lead to errors in runtime, if you have problems with downoloading files come here!
					 */
					data.forEach((item: any) => formData.append('files[]', item));

					const responseUpload: Response = await Transport.post(
						url,
						headers,
						formData,
					);
					const uploadData: { code: number; data: { url: string; }[] } = await responseUpload.json();

					console.log(uploadData.data[0].url);

					const headers2: Headers = new Headers({
						authorization: `Bearer ${token}`,
						event: user.appdata.eventID.toString(),
					});

					for(let i = 0; i < uploadData.data.length;i++) {
						const body: object = {
							action: 'add',
							target: 'company',
							event_id : 134,
							url : uploadData.data[i].url,
						};
		
						const response: Response = await Transport.post(GET_FILES, headers2, body);
	
						const json2: any = await response.json();
						console.log(json2);
					}

					if (+uploadData.code === 200) {
						if (cb) {
							cb(uploadData.data.map(item => item.url));
						}
					} else {
						notification.error({message: 'Не удалось загрузить', description: 'Попробуйте еще раз'});
					}
				} else {
					notification.error({message: 'Не удалось загрузить', description: 'Попробуйте еще раз'});
				}
			} catch (e) {
				notification.error({message: 'Не удалось загрузить', description: 'Попробуйте еще раз'});
			}
		};
	};
}
