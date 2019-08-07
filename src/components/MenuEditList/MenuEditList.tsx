import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Icon, List, Row, Col, Modal, Skeleton, Avatar, Button, Popconfirm, Card } from 'antd';
import { IAppIcon, IMenu, IModule } from 'react-cms';
import { get } from 'lodash';
import styled from 'styled-components';
import { ColorResult, SketchPicker } from 'react-color';

import './MenuEditList.scss';

import AutoComplete from '../../components/Autocomplete/Autocomplete';
import Input from '../../components/Input/Input';
import CheckBox from '../../components/CheckBox/CheckBox';
import AddMenuForm from './components/AddMenuForm';

import b from '../../service/Utils/b';
import FakeImg from '../FakeImg/FakeImg';
import { IReducers } from '../../redux';
import { getIcons, getMenu, getModules } from '../../redux/common/common.selector';
import { CommonApi } from '../../redux/common/common.api';
import { MenuEditListApi } from './api/menuEditList';
import { IMenuReducerType } from '../../redux/common/common.reducer';

const AutoCompletePlaceholder = styled.div`
  .ant-select-auto-complete.ant-select .ant-select-selection__placeholder {
    top: 16px;
  }
`;

const MenuWraper = styled.div`
  .ant-layout-sider-children{

  }
`;

const ItemWrapper = styled.div`
  width: 100%;
  
  .ant-row {
    width: 100%;
  }
`;

const PickerWrapper = styled.div`
  .sketch-picker {
    margin: 0 auto;
  }
`;

interface IProps {
  menu?: IMenuReducerType;
  modules?: IModule[];
  icons?: IAppIcon[];
  updateMenu?: (id: number, key: string, value: string) => void;
  getModules?: () => void;
  getIcons?: () => void;
  removeMenu?: (id: number) => void;
  updateSort?: (sortData: { [key: string]: number; }) => void;
}

interface IState {
  isShowColorModal: boolean;
  isShowIconsModal: boolean;
  isShowAddMenu: boolean;
  pickerColor: string;
  currentIcon: string;
  currentIdInModal: number | null;
}

class MenuEditList extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    
    this.state = {
      isShowColorModal: false,
      isShowIconsModal: false,
      isShowAddMenu: false,
      pickerColor: 'ffffff',
      currentIcon: '',
      currentIdInModal: null,
    };
  }
  
  public componentDidMount() {
    const {getIcons, getModules} = this.props;
    
    getModules();
    getIcons();
  }

  public render(): JSX.Element {
    const {icons, menu} = this.props;

    const {isShowColorModal, isShowIconsModal, isShowAddMenu, pickerColor, currentIdInModal} = this.state;
  
    const isModal: boolean = isShowColorModal || isShowIconsModal || isShowAddMenu;
    const footer = isShowAddMenu || !isModal ? {footer: null} : isShowIconsModal
      ? {
        footer: [
            <Button key={ 'back' } onClick={ this.closeModal }>Закрыть окно</Button>,
        ],
      }
      : {
        footer: [
          <Button key={ 'back' } onClick={ this.closeModal }>Закрыть окно</Button>,
          <Button key={ 'pick' } type={ 'primary' } onClick={ this.updateModal(currentIdInModal, 'color', pickerColor) }>Выбрать цвет</Button>,
        ],
      };
    
    return (
      <React.Fragment>
        <Card title={ 'Меню' } extra={ <Button icon={ 'plus' } onClick={ this.toggleAddMenu }>Добавить меню</Button> } bodyStyle={ {display: 'none'} } />
        
        <div style={ { height: 1000, overflowY: 'scroll'} }>
          <List
            
            dataSource={ menu.data }
            renderItem={ this.getListContent }
          />
        </div>
        <Modal
          title={ isModal ? this.getTitleByModalType(isShowColorModal, isShowIconsModal, isShowAddMenu) : '' }
          visible={ isModal }
          width={ 782 }
          onOk={ isShowColorModal ? this.updateModal(currentIdInModal, 'color', pickerColor) : null }
          okText={ `Выбрать ${isShowColorModal ? 'цвет' : 'иконку'}` }
          onCancel={ this.closeModal }
          cancelText={ 'Закрыть окно' }
          { ...footer }
        >
          {
            isShowColorModal && <PickerWrapper>
              <SketchPicker
                color={ `#${pickerColor}` }
                onChangeComplete={ this.handleChangeComplete }
              />
            </PickerWrapper>
          }
  
          {
            isShowIconsModal && <List
              className={ 'demo-loadmore-list' }
              itemLayout={ 'horizontal' }
              dataSource={ icons }
              renderItem={ this.renderIconItem }
            />
          }
          
          {
            isShowAddMenu && <Card>
              <AddMenuForm onSend={ this.toggleAddMenu } />
            </Card>
          }
        </Modal>
      </React.Fragment>
    );
  }

  // move: true – down, false - up
  private onChangeSort = (id: number, index: number, move: boolean = true) => () => {
    const {updateSort, menu} = this.props;
    updateSort({ [id]: move ? index + 1 : index - 1, [menu.data[index + (move ? 1 : -1)].id]: index });
  };

  private getListContent = (item: IMenu, index: number): JSX.Element => {
    const {menu, modules} = this.props;
    const moduleDefaultValue: string = get(modules.find(module => +module.id === +item.module), 'name', '');

    return (
      <List.Item>
        <ItemWrapper>
          <Row>
            <Col span={ 2 }>
              <Icon
                type='up'
                style={ {cursor: 'pointer', visibility: index !== 0 ? 'visible' : 'hidden' } }
                onClick={ this.onChangeSort(item.id, index, false) }
              />
              <Icon
                type='down'
                style={ {cursor: 'pointer', visibility: index !== menu.data.length - 1 ? 'visible' : 'hidden' } }
                onClick={ this.onChangeSort(item.id, index, true) }
              />
            </Col>

            <Col span={ 2 }>
              {
                item.pic.includes('http')
                  ? <img
                    src={ item.pic }
                    className={ b('menu', 'img') }
                    style={ {cursor: 'pointer'} }
                    onClick={ this.toggleIconModal(item.pic, item.id) }
                  />
                  : <FakeImg onClick={ this.toggleIconModal(item.pic, item.id) } />
              }
            </Col>

            <Col span={ 8 } offset={ 1 }>
              <Input
                value={ item.name }
                placeholder={ 'Введите имя' }
                onBlur={ this.onUpdate(item.id, 'name') }
              />
              
              <br />
              <br />
              
              <AutoCompletePlaceholder>
                <AutoComplete
                  value={ moduleDefaultValue }
                  placeholder={ 'Тип модуля' }
                  onPick={ this.onUpdate(item.id, 'module', 'value', value => +modules.find(item => item.name === value).id) }
                  data={ modules.map(module => module.name) }
                  style={ {width: '100%'} }
                />
              </AutoCompletePlaceholder>
            </Col>
  
            <Col span={ 4 } offset={ 1 }>
              <CheckBox
                text={ 'Активно' }
                value={ Boolean(item.enabled) }
                onChange={ this.onUpdate(item.id, 'enabled', 'checked',value => +value) }
              />
              <br />
              <CheckBox
                text={ 'Видимость' }
                value={ Boolean(item.visible) }
                onChange={ this.onUpdate(item.id, 'visible', 'checked',value => +value) }
              />
            </Col>

            <Col span={ 5 }>
              <CheckBox
                text={ 'Особый цвет?' }
                value={ Boolean(item.customColor) }
                onChange={ this.onUpdate(item.id, 'customColor', 'checked',value => +value) }
              />
              <br />
              
              <div
                style={ {
                  width: 16,
                  height: 16,
                  background: `#${item.color}`,
                  display: 'inline-block',
                  border: '1px solid grey',
                  marginTop: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                } }
                onClick={ this.toggleColorModal(item.color, item.id) }
              />
              <span style={ {cursor: 'pointer'} } onClick={ this.toggleColorModal(item.color, item.id) }> Выбрать цвет</span>
            </Col>
            
            <Col span={ 1 }>
              <Popconfirm
                title={ 'Вы уверены?' }
                onConfirm={ this.removeMenu(item.id) }
                okText={ 'Да' }
                cancelText={ 'Нет' }
              >
                <Icon type={ 'close' } style={ {cursor: 'pointer'} } />
              </Popconfirm>
            </Col>
          </Row>
        </ItemWrapper>
      </List.Item>
    );
  };

  private onUpdate = (id: number, key: string, valueKey: string = 'value', updater?: (value) => string | number) => {
    return (event: any) => this.props.updateMenu(
      id,
      key,
      updater
        ? updater(get(event, `target.${valueKey}`, event))
        : get(event, `target.${valueKey}`, event),
    );
  };
  
  private toggleAddMenu = () => this.setState({isShowAddMenu: !this.state.isShowAddMenu});
  
  private toggleColorModal = (color: string, id?: number) => () => {
    const {isShowColorModal} = this.state;
    if (!isShowColorModal) {
      return this.setState({
        isShowColorModal: !isShowColorModal,
        pickerColor: color,
        currentIdInModal: id,
      });
    }
    
    this.setState({isShowColorModal: !isShowColorModal});
  };
  
  private toggleIconModal = (currentIcon: string, id?: number) => () => {
    const {isShowIconsModal} = this.state;
    if (!isShowIconsModal) {
      return this.setState({
        isShowIconsModal: !isShowIconsModal,
        currentIdInModal: id,
        currentIcon,
      });
    }
  
    this.setState({isShowIconsModal: !isShowIconsModal});
  };
  
  private updateModal = (id: number, key: string, value: string) => {
    return () => {
      this.props.updateMenu(id, key, value);
      this.setState({isShowColorModal: false, isShowIconsModal: false});
    };
  };
  
  private handleChangeComplete = (color: ColorResult) => this.setState({pickerColor: color.hex.replace('#', '')});
  
  private closeModal = () => this.setState({isShowColorModal: false, isShowIconsModal: false, isShowAddMenu: false});
  
  private renderIconItem = (item: IAppIcon) => (
    <List.Item actions={ [<a key={ 1 } onClick={ this.updateModal(this.state.currentIdInModal, 'pic', item.url) }>Выбрать</a>] }>
      <Skeleton title={ false } loading={ false } avatar active>
        <List.Item.Meta avatar={ <Avatar src={ item.url } /> } />
      </Skeleton>
      { this.state.currentIcon === item.url && <div>Текущая</div> }
    </List.Item>
  );
  
  private removeMenu = (id: number) => () => this.props.removeMenu(id);
  
  private getTitleByModalType = (isShowColorModal: boolean, isShowIconsModal: boolean, isShowAddMenu: boolean): string => {
    if (isShowColorModal) {
      return 'Выберите цвет';
    }
    
    if (isShowIconsModal) {
      return 'Выберите иконку';
    }
    
    if (isShowAddMenu) {
      return 'Новое меню';
    }
    
    return '';
  };
}

const getMenuSelector = getMenu();

const mapStateToProps = (state: IReducers) => {
  return {
    menu: getMenuSelector(state),
    modules: getModules(state),
    icons: getIcons(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    getMenu: () => dispatch(CommonApi.getMenu()),
    getModules: () => dispatch(CommonApi.getModules()),
    updateMenu: (id: number, key: string, value: string) => dispatch(MenuEditListApi.updateMenu(id, key, value)),
    removeMenu: (id: number) => dispatch(MenuEditListApi.removeMenu(id)),
    updateSort: (sortData: { [key: string]: number; }) => dispatch(MenuEditListApi.updateSort(sortData)),
    getIcons: () => dispatch(MenuEditListApi.getIcons()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MenuEditList);
