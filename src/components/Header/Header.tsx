import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Layout, Row, Col, Icon } from 'antd';
import { IUser } from 'react-cms';
import styled from 'styled-components';

import { getUserData } from '../../redux/auth/auth.selector';
import { IReducers } from '../../redux';
import { AuthApi } from '../../redux/auth/auth.api';

const HeaderWrapper = styled.div`
  .ant-row{
    display: flex;
    justify-content: space-between;
  }
  
  .ant-row span {
    color: #ffffff;
  }
  
  .ant-layout-header {
    background: #1890ff;
    box-shadow: 0 3px 2px rgba(0,0,0,0.22), 0 1px 1px rgba(0,0,0,0.15);
    position: fixed;
    width: 100%;
    z-index: 999;
  }
  
  .ant-col-6 {
    line-height: 26px;
  }
`;

const LogoutButton = styled.span`
  color: #ffffff;
  cursor: pointer;
  display: block;
  text-align: end;
  margin-right: 10%;
  &:hover {
    text-decoration: underline;
  }
`;

interface IProps {
  user?: IUser;
  logout?: () => void;
}

class Header extends React.Component<IProps> {
  public render(): JSX.Element {
    const {user, logout} = this.props;
    console.log(user);

    return (
      <HeaderWrapper>
        <Layout.Header>
            <Row>
              <Col style={ { width:'fit-content' } } span={ 6 }>
              { !user.appdata
                ?<p>
                  <span style={ {fontSize: '16pt', fontWeight: 'bold'} }>Выбор приложения</span>
                  <br />
                  <span>Создайте или выберите существующее приложение</span>
               </p>
                :<p>
                  <span style={ {fontSize: '16pt', fontWeight: 'bold'} }>{ user.appdata.eventName }</span>
                  <br />
                  <span>{ user.appdata.name }</span>
                </p>
                }
              </Col>

              <Col span={ 9 }/>
              <Col span={ 5 }>
                <span>{ user.user_name || user.user_screen_name }</span>
              </Col>

              <Col span={ 2 }>
                <LogoutButton onClick={ logout }>Выйти</LogoutButton>
              </Col>
            </Row>
        </Layout.Header>
      </HeaderWrapper>
    );
  }
}

const mapStateToProps = (state: IReducers) => {
  return {
    user: getUserData(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    logout: () => dispatch(AuthApi.logout()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
