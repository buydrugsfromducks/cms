import * as React from 'react';
import { compose, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Layout, Row, Col } from 'antd';
import { IContainer } from 'react-cms';
import styled from 'styled-components';

import './Content.scss';

import { IReducers } from '../../redux';
import { CommonApi } from '../../redux/common/common.api';
import { getContainer } from '../../redux/common/common.selector';

import List from './components/List';
import ContentList from './components/ContentList';

const ContentWrapper = styled.div`
  margin-left: 185px;
  height: 100%;

  .ant-col-6 .ant-layout-sider {
    height: 100% !important;
    min-width: none !important;
    max-width: none !important;
    width: 100% !important;
  }
  
  .ant-col-6, .ant-col-18 {
    height: calc(100vh - 66px);
    overflow-y: scroll;
    background: #ffffff;
  }

  .ant-col-18 {
    margin-left: 8px;
    width: 74%;
  }

  //Create custom scrollbar
  .ant-col-6::-webkit-scrollbar-track{
    background-color: #f5f5f5;
  }

  .ant-col-6::-webkit-scrollbar{
    width: 7px;
    background-color: #f5f5f5;
  }

  .ant-col-6::-webkit-scrollbar-thumb{
    background: #1890ff;
  }

  .ant-col-6 {
    scrollbar-width: thin;
    scrollbar-color: #1890ff #f5f5f5;
  }
`;
const {Sider} = Layout;

interface IProps {
  container?: IContainer;
  getMenu?: () => void;
  getModules?: () => void;
}

class Content extends React.Component<IProps> {
  public componentDidMount() {
    const {getMenu, getModules} = this.props;

    getMenu();
    getModules();
  }

  public render(): JSX.Element {
    const {container} = this.props;

    return (
      <ContentWrapper>
        <Row>
          <Col span={ 6 }>
            <Sider style={ { background: '#fff', height: '100%' } }>
              <List />
            </Sider>
          </Col>

          {
            container.data
              ? (
                <Col span={ 18 }>
                  <Sider width={ '100%' } style={ { background: '#fff', height: '100%' } }>
                    <ContentList />
                  </Sider>
                </Col>
              )
              : (<Col span={ 18 }>
                <Sider width={ '100%' } style={ { background: '#fff', height: '100%' } }>
                  <div style={ {width: '100%', height: '100%', textAlign: 'center'} }>
                    <span style={ {fontSize: '14pt', fontWeight: 'bold'} }>Выберите контент, который хотите редактировать</span>
                  </div>
                </Sider>
              </Col>)
          }
        </Row>
      </ContentWrapper>
    );
  }
}

const mapStateToProps = (state: IReducers) => {
  return {
    container: getContainer(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    getMenu: () => dispatch(CommonApi.getMenu()),
    getModules: () => dispatch(CommonApi.getModules()),
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Content);
