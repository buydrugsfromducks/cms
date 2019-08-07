import { IReducers } from '../index';
import { IUser } from 'react-cms';

export const getUserData = (state: IReducers): IUser => state.auth.user;
export const getAuthLoading = (state: IReducers): boolean => state.auth.loading;
export const getCurrentMenu = (state: IReducers): string => state.auth.path;

export const getCurrentStatus = (state: IReducers): number => state.auth.code;
