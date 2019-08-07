import * as React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import { withRouter } from 'react-router-dom';
import { Switch } from 'react-router';
import { Layout, Spin } from 'antd';
import { IUser } from 'react-cms';
import { get } from 'lodash';

import './App.scss';

import { parseAll } from '../../service/UrlParser/UrlParser';
import { publicRoutes, privateRoutes } from '../../routes';
import { IReducers } from '../../redux';

import Menu from '../../components/Menu/Menu';
import Info from '../../components/Info/Info';
import Header from '../../components/Header/Header';
import { AuthApi } from '../../redux/auth/auth.api';
import { getAuthLoading, getUserData } from '../../redux/auth/auth.selector';
import { setMenu } from '../../redux/auth/auth.reducer';

const {Content, Sider} = Layout;

interface IProps {
  user?: IUser;
  isAuthLoading?: boolean;
  location?: Location;
  checkAuth?: (token: string) => void;
  saveParams?: (params: object) => void;
  setMenu?: (menu: string) => void;
}

class App extends React.Component<IProps> {
  public componentDidMount() {
    const {location, checkAuth, setMenu} = this.props;

    setMenu(location.pathname);
    const params: object = parseAll(location.search);
    checkAuth(get(params, 'token', null));
  }

  public componentDidUpdate(prevProps) {
    return this.props.user !== prevProps.user;
  }
  
  public render(): JSX.Element {
    const {isAuthLoading, user} = this.props;
    const isShowMenus: boolean = !isAuthLoading && !!user;
    const isShowSider: boolean = this.props.location.pathname !== '/select';

    return (
      <Layout style={ {minHeight: '100vh'} }>
        { isShowMenus && <Header /> }

        <Layout style={ {top: 64, position: 'fixed', height: 'calc(100vh - 64px)', width: '100%'} }>
          { isShowSider && isShowMenus && <Sider width={ 200 } style={ { background: '#fff', height: 'calc(100vh - 64px)', position: 'fixed' } }><Menu /></Sider> }

          <Content style={ { padding: '0 24px', minHeight: 280 } }>
            { this.getContent() }
          </Content>
        </Layout>
      </Layout>
    );
  }

  private getContent = (): JSX.Element => {
    const { isAuthLoading, user, location } = this.props;

    // if (!isAuthLoading && !get(user, 'user_id', null)) {
    //   return location.pathname !== '/signup' ? <Info type={ 'Forbidden' } /> : <Info type={ 'SignUp' } /> ;
    // }
    // if(!!user){
    //   if(user.code){
    //     Reflect.deleteProperty(this.props.user, 'code')
    //   }
    // }

    if (isAuthLoading) {
      return <Spin size={ 'large' } style={ { position: 'relative', top: 10 } } />;
    }

    return (
      <Switch>
        { 
          !!user && !isAuthLoading
          ? privateRoutes
          : publicRoutes
        }
      </Switch>
    );
  };
}

const mapStateToProps = (state: IReducers) => {
  return {
    isAuthLoading: getAuthLoading(state),
    user: getUserData(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    checkAuth: (token: string) => dispatch(AuthApi.checkAuth(token)),
    setMenu: (menuPath: string) => dispatch(setMenu({menuPath})),
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(App);
