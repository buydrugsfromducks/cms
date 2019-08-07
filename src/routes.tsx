import * as React from 'react';
import { Route, Switch } from 'react-router';

import Info from './components/Info/Info';
import Main from './containers/Main/Main';
import Menu from './containers/Menu/Menu';
import Content from './containers/Content/Content';
import People from './containers/People/People';
import Events from './containers/Events/Events';
import Icons from './containers/Icons/Icons';
import FilePicker from './containers/FilePicker/FilePicker';
import Locations from './containers/Locations/Locations';
import Company from './containers/Company/Company';
import Login from './containers/Login/Login';
import Registration from './containers/Registration/Registration';

import SelectApp from './containers/SelectApp/SelectApp';

export const PATHS: { [key: string]: string; } = {
	MAIN: '/',
	MENU_EDIT: '/menu',
	CONTENT: '/content',
	PEOPLE: '/people',
	COMPANY: '/company',
	EVENTS: '/events',
	PEOPLE_SECTION: '/people-section',
	COMPANY_SECTION: '/company-section',
	ICONS: '/icons',
	LOCATIONS: '/locations',
	LOGIN: '/login',
	SELECT_APP: '/select',
	SIGNUP: '/signup',
	FILEPICKER: '/filepicker',
};

const NotFoundRender = () => <Info type='NotFound' />;

const signUp = () => <Info type='SignUp' />;
const login = () => <Info type='Forbidden' />;

const DevelopmentRender = () => <Info type='Development' />;

export const publicRoutes: JSX.Element = (
	<Switch>
		<Route exact path={ PATHS.SIGNUP } component={ Registration } />
		<Route render={ login } />
	</Switch>
);

export const privateRoutes: JSX.Element = (
	<Switch>
		<Route exact path={ PATHS.SELECT_APP } component={ SelectApp } />
		<Route exact path={ PATHS.MAIN } component={ Main } />
		<Route path={ PATHS.SIGNUP } render={ signUp } />
		<Route exact path={ PATHS.MENU_EDIT } component={ Menu } />
		<Route exact path={ PATHS.CONTENT } component={ Content } />
		<Route exact path={ PATHS.PEOPLE } component={ People } />
		<Route exact path={ PATHS.COMPANY } component={ Company } />
		<Route exact path={ PATHS.EVENTS } component={ Events } />
		{ /* <Route exact path={PATHS.ICONS} component={Icons} /> */ }
		<Route exact path={ PATHS.FILEPICKER } component={ FilePicker } />
		<Route exact path={ PATHS.LOCATIONS } component={ Locations } />
		<Route exact path={ PATHS.PEOPLE_SECTION } render={ DevelopmentRender } />
		<Route exact path={ PATHS.COMPANY_SECTION } render={ DevelopmentRender } />
		<Route render={ NotFoundRender } />
	</Switch>
);
