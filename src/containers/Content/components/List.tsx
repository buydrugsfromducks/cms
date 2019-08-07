import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { List, Row, Col } from 'antd';
import { IMenu, IModule } from 'react-cms';
import { get } from 'lodash';
import styled, { css } from 'styled-components';

import b from '../../../service/Utils/b';
import { IReducers } from '../../../redux';
import { getMenu, getModules } from '../../../redux/common/common.selector';
import { ContentAPI } from '../api/content';

import FakeImg from '../../../components/FakeImg/FakeImg';
import { IMenuReducerType } from '../../../redux/common/common.reducer';

const ContentWrapper = styled.div`
  cursor: pointer;
  ${(props: { isCurrentMenu: boolean; }) => css`
    background: ${props.isCurrentMenu ? '#ffffff' : '#e6f7ff'};
    border-right: ${props.isCurrentMenu ? '0' : '3px solid #1890ff'};
    min-height: 65px;
  `}

  .ant-col-4 {
    top: 6px;
    width: 50px;
    text-align: center;
    background: aliceblue;
    border-radius: 40px;
  }
`;

const Title = styled.p`
  font-size: 12pt;
  font-weight: bold;
  @media(max-width: 1395px){
    font-size: 10pt;
    font-weight: bold;
  }
`;

interface IProps {
  menu?: IMenuReducerType;
  modules?: IModule[];
  getContainer?: (id: number) => void;
  getMenus?: () => void;
}

interface IState {
  currentMenu: number;
}

class MenuList extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      currentMenu: null,
    };
  }

  public render(): JSX.Element {
    const {menu} = this.props;

    return (
      <React.Fragment>
        {
          menu.isOk
            ? <List
                dataSource={ menu.data }
                renderItem={ this.getListContent }
                loading={ menu.data.length === 0 }
            />
            : <span style={ {color: '#000000', textAlign: 'center', padding: 20, fontSize: '21px'} }>
              Ошибка при получении контента
            </span>
        }
      </React.Fragment>
    );
  }

  private getListContent = (item: IMenu, index: number): JSX.Element => {
    const {menu, modules} = this.props;
    const {currentMenu} = this.state;

    return (
      <ContentWrapper isCurrentMenu={ currentMenu !== item.id }>
        <div onClick={ this.getContainer(item.id) }>
          <Row>
            <Col span={ 4 }>
              {
                item.pic.includes('http')
                  ? <img
                    src={ item.pic }
                    style={ {top: 0} }
                    className={ b('menu', 'img') }
                  />
                  : <FakeImg style={ {position: 'relative'} } />
              }
            </Col>
            <Col span={ 19 } style={ { minHeight: 65 } } >
              <Title>{ item.name }</Title>
              <p style={ {lineHeight: '10px'} }>{ get(modules.find(module => +module.id === +item.module), 'name', '') }</p>
            </Col>
          </Row>

          { menu.data.length - 1 !== index && <hr style={ {margin: 0, borderTop: 0, borderBottom: '1px solid black'} } /> }
        </div>
      </ContentWrapper>
    );
  };

  private getContainer = (id: number) => () => {
    this.props.getContainer(id);
    this.setState({currentMenu: id});
  };
}

const getMenuSelector = getMenu();

const mapStateToProps = (state: IReducers) => {
  return {
    menu: getMenuSelector(state),
    modules: getModules(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    getContainer: (id: number) => dispatch(ContentAPI.getContainer(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MenuList);
