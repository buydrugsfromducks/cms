import * as React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import { Switch, Card, Button, Modal, Form, Icon, Input } from 'antd';
import { EnumTarget, IContainer, ILocation, IProgramModule, IUser } from 'react-cms';
import ReactTable, { Column, RowInfo } from 'react-table';
import { FormComponentProps } from 'antd/lib/form';
import { get } from 'lodash';
import styled from 'styled-components';
import * as moment from 'moment';

import { IReducers } from '../../../redux';
import { ContentAPI } from '../api/content';
import { getContainer, getMenuData } from '../../../redux/common/common.selector';
import { getUserData } from '../../../redux/auth/auth.selector';
import { timeFromUnixToFormat } from '../../../service/Utils/Utils';

import { MenuEditListApi } from '../../../components/MenuEditList/api/menuEditList';
import EditProgram from './EditProgram';
import AutoComplete from '../../../components/Autocomplete/Autocomplete';
import { DATE_FORMAT, ONLY_DATE_FORMAT, ONLY_TIME_FORMAT, SHORT_DATE_FORMAT } from '../../../service/Consts/Consts';
import b from '../../../service/Utils/b';
import { setCurrentEntity } from '../../../redux/common/common.reducer';

const FiltersRowWrapper = styled.div`  
  display: inline-flex;
  position: absolute;
  right: 0;
`;

interface IProps extends FormComponentProps {
  user?: IUser;
  container?: IContainer;
  locations?: ILocation[];
  currentEntity?: any;

  getMenuData?: (enumTarget: EnumTarget) => void;
  updateContainer?: (id: number, action: string, data: object, cb?: () => void) => void;
  setCurrentEntity?: (entity) => void;
}

interface IState {
  modalVisible: boolean;
  isAdd: boolean;
  currentEntity: IProgramModule | null;
  currentIndex: number;
}

class ModuleProgram extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    locations: [],
  };
  private columns: Column[] = [
    {
      Header: 'Время',
      accessor: 'time',
      Cell: (cellInfo: RowInfo) => (
        <div>
          <span style={ { fontWeight: 'bold' } }>
            { moment(cellInfo.original.startTime, DATE_FORMAT).format(ONLY_TIME_FORMAT) }
            { cellInfo.original.finish !== 0 ? ` - ${moment(cellInfo.original.endTime, DATE_FORMAT).format(ONLY_TIME_FORMAT)}` : '' }
          </span>
          <br />
          <span style={ { color: 'grey', fontWeight: 'normal' } }>
            { moment(cellInfo.original.startTime, DATE_FORMAT).locale('ru').format('dddd') }, { moment(cellInfo.original.startTime, DATE_FORMAT).format(SHORT_DATE_FORMAT) }
          </span>
        </div>
      ),
      width: 180,
    },
    {
      Header: 'Название',
      accessor: 'name',
      Cell: (cellInfo: RowInfo) => (
        <div>
          <p style={ { fontWeight: 'bold' } }>{ cellInfo.original.title }</p>
          <span style={ { color: 'grey' } }>{ cellInfo.original.location_name }</span>
        </div>
      ),
    },
    {
      Header: 'Видимость',
      accessor: 'visible',
      Cell: (cellInfo: RowInfo) => (
        <Switch
          checked={ Boolean(get(cellInfo, 'original.visible', 1)) }
          className={ b('content', 'program-table-switch-position', { 'without-location': !cellInfo.original.location_name }) }
        />
      ),
      width: 100,
    },
    {
      Header: 'Обновлено',
      accessor: 'updated',
      Cell: (cellInfo: RowInfo) => (
        <div style={ { display: 'flex', flexDirection: 'column', textAlign: 'right' } }>
          <span>{ cellInfo.original.updated.slice(0, 10) }</span>
          <span>{ cellInfo.original.updated.slice(10, 16) }</span>
        </div>
      ),
      width: 100,
    },
  ];

  constructor(props: IProps) {
    super(props);

    this.state = {
      modalVisible: false,
      isAdd: false,
      currentEntity: null,
      currentIndex: 0,
    };
  }

  public componentDidMount() {
    const { getMenuData } = this.props;
    getMenuData('locations');
  }

  public render(): JSX.Element {
    const { container: { data, isLoading }, user, locations, form, currentEntity } = this.props;
    const { modalVisible, isAdd } = this.state;
    const { getFieldDecorator } = form;

    return (
      <Card
        title={ (
          <React.Fragment>
            <Button icon={ 'plus' } onClick={ this.onOpenAddModal } type={ 'primary' }>Добавить</Button>
            <Button icon={ 'setting' } style={ { left: 10 } } disabled />

            <FiltersRowWrapper style={ { maxWidth: 500 } }>
              <Form.Item style={ { top: -5 } }>
                { getFieldDecorator('date', {
                  rules: [{ required: false }],
                })(
                  <AutoComplete
                    placeholder={ 'Дата' }
                    data={
                      data
                        .map((item: { start: number; }) => timeFromUnixToFormat(item.start).slice(0, 10))
                        .filter((item: any, index: any, self: { indexOf: (arg0: any) => void; }) => self.indexOf(item) === index)
                    }
                    onPick={ this.onFiltered('date') }
                  />,
                ) }
              </Form.Item>

              <Form.Item style={ { top: -5 } }>
                { getFieldDecorator('location', {
                  rules: [{ required: false }],
                })(
                  <AutoComplete
                    placeholder={ 'Локация' }
                    data={
                      locations
                        .map(item => item.name)
                        .filter((item: any, index: any, self: { indexOf: (arg0: any) => void; }) => self.indexOf(item) === index) }
                    onPick={ this.onFiltered('locations') }
                  />,
                ) }
              </Form.Item>

              <Button icon={ 'reload' } onClick={ this.dropFilters } style={ { height: 30 } } />

              <Input addonBefore={ <Icon type={ 'search' } /> } placeholder={ 'Поиск' } disabled />
            </FiltersRowWrapper>
          </React.Fragment>
        ) }
      >
        <ReactTable
          data={ this.filter(data.map((item: IProgramModule) => ({
            ...item,
            visibleString: Boolean(item.visible) ? 'Да' : 'Нет',
            descriptionShort: item.description.slice(0, 200),
            startTime: timeFromUnixToFormat(moment.unix(item.start).add({ hour: user.appdata.eventTimeShift }).unix()),
            endTime: timeFromUnixToFormat(moment.unix(item.finish).add({ hour: user.appdata.eventTimeShift }).unix()),
            updated: moment.unix(item.updated_at).format(DATE_FORMAT),
          }))) }
          columns={ this.columns }
          pageSize={ data.length }
          noDataText={ 'Нет информации' }
          loadingText={ 'Загрузка...' }
          loading={ isLoading }
          className={ '-striped -highlight' }
          getTrProps={ this.onRowClick }
          showPagination={ false }
          resizable={ false }
          style={ { color: '#000000', maxHeight: '85vh' } }
        />

        <Modal visible={ modalVisible } footer={ null } onCancel={ this.onCloseModal } width={ 782 }>
          {
            <EditProgram
              closeModal={ this.onCloseModal }
              entity={ isAdd ? null : currentEntity }
              user={ user }
              isAdd={ isAdd }
            />
          }
        </Modal>
      </Card>
    );
  }

  private onCloseModal = () => this.setState({ modalVisible: false });

  private onOpenAddModal = () => this.setState({ isAdd: true, modalVisible: true });

  private onRowClick = (state: any, rowInfo: RowInfo, column: any) => ({
    onClick: () => {
      this.setState({
        currentIndex: rowInfo.index,
        modalVisible: true,
        isAdd: false,
      });
      this.props.setCurrentEntity(rowInfo.original);
    },
    style: { cursor: 'pointer' },
  });

  private filter(data: any[]): any[] {
    const { form } = this.props;
    const dateFilter = form.getFieldValue('date');
    const locationFilter = form.getFieldValue('location');

    return (!!dateFilter || !!locationFilter)
      ? data
        .filter(item => (dateFilter ? timeFromUnixToFormat(item.start).includes(dateFilter) : true) &&
          (locationFilter ? item.location_name === locationFilter : true)
          ? item
          : null,
        )
        .filter(item => !!item)
      : data;
  }

  private onFiltered(key: 'date' | 'locations') {
    return (value: string) => {
      const { form } = this.props;
      key === 'date'
        ? form.setFieldsValue({ date: value })
        : form.setFieldsValue({ location: value });
    };
  }

  private dropFilters = () => this.props.form.setFieldsValue({ date: '', location: '' });
}

const mapStateToProps = (state: IReducers) => {
  return {
    container: getContainer(state),
    locations: getMenuData(state, 'locations'),
    people: getMenuData(state, 'people'),
    user: getUserData(state),
    currentEntity: state.common.currentEntity,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    updateContainer: (id: number, action: string, data: object, cb?: () => void) => dispatch(ContentAPI.updateContainer(id, action, data, cb)),
    getMenuData: (enumTarget: EnumTarget) => dispatch(MenuEditListApi.getMenuData(enumTarget)),
    setCurrentEntity: entity => dispatch(setCurrentEntity(entity)),
  };
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  Form.create(),
)(ModuleProgram);
