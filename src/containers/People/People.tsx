import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Card, Modal, Button, Switch, Row, Col, Input, Icon } from 'antd';
import ReactTable, { Column, RowInfo } from 'react-table';
import { IPeople } from 'react-cms';
import { get } from 'lodash';
import * as moment from 'moment';

import { IReducers } from '../../redux';
import { PeopleAPI } from './api/people';
import { getPeople } from '../../redux/common/common.selector';
import { DATE_FORMAT } from '../../service/Consts/Consts';

import FakeImg from '../../components/FakeImg/FakeImg';
import EditForm from './components/EditForm';

interface IProps {
  people?: IPeople[];
  getPeople?: () => void;
}

interface IState {
  modalVisible: boolean;
  isAdd: boolean;
  currentPeople: IPeople | null;
}

class People extends React.Component<IProps, IState> {
  private static columns: Column[] = [
    {
      Header: 'Название',
      accessor: 'name',
      Cell: (cellInfo: RowInfo) => {
        const image: string = get(cellInfo, 'original.img') || 'fake';
        const subtitle: string = get(cellInfo, 'original.data.subtitle');

        return (
          <div>
            <Row gutter={ 24 }>
              <Col span={ 8 } className='image-placeholder' style={ { paddingLeft: 0, paddingRight: 0 } }>
                <React.Fragment>
                  {
                    image.includes('http')
                      ? <img
                        src={ image }
                        style={ { maxWidth: 70, maxHeight: 70 } }
                      />
                      : <FakeImg />
                  }
                </React.Fragment>
              </Col>
              <Col span={ 12 } style={ { margin: '0 0 0 -8px', padding: 0 } }>
                <p style={ { margin: 0, fontWeight: 'bold' } }>{ cellInfo.original.name }</p>
                <p>{ cellInfo.original.mobile }</p>
              </Col>
            </Row>
          </div>
        );
      },
      style: {
        width: 'fit-content',
      },
    },
    {
      Header: 'Группа',
      accessor: 'category',
      width: 150,
    },
    {
      Header: 'Видимость',
      accessor: 'visible',
      Cell: (cellInfo: RowInfo) => (
        <Switch
          checked={ Boolean(get(cellInfo, 'original.visible')) }
          className='content__module-table-switch-position'
        />
      ),
      width: 100,
    },
    {
      Header: 'Обновлено',
      accessor: 'updated',
      width: 150,
    },
  ];

  constructor(props: IProps) {
    super(props);

    this.state = {
      modalVisible: false,
      isAdd: false,
      currentPeople: null,
    };
  }

  public componentDidMount() {
    const { getPeople } = this.props;
    getPeople();
  }

  public render(): JSX.Element {
    const { people } = this.props;
    const { isAdd, modalVisible, currentPeople } = this.state;

    return (
      <Card
        style={ { marginLeft: 185, height: '100vh' } }
        title={ (
          <Row>
            <Col span={ 6 }>
              <Button icon={ 'plus' } onClick={ this.onOpenAddModal } type={ 'primary' }>Добавить спонсора</Button>
              <Button icon={ 'setting' } style={ { left: 10 } } disabled />
            </Col>

            <Col span={ 5 } offset={ 13 }>
              <Input addonBefore={ <Icon type={ 'search' } /> } placeholder={ 'Поиск' } disabled />
            </Col>
          </Row>
        ) }
      >
        <ReactTable
          data={ people.map(item => ({
            ...item,
            category: 'Нет категории',
            updated: moment.unix(item.updated_at).format(DATE_FORMAT),
          })) }
          columns={ People.columns }
          pageSize={ people.length }
          noDataText={ 'Нет информации' }
          loadingText={ 'Загрузка...' }
          className={ '-striped -highlight' }
          getTrProps={ this.onRowClick }
          showPagination={ false }
          resizable={ false }
          style={ { color: '#000000', maxHeight: '85vh' } }
        />

        <Modal visible={ modalVisible } footer={ null } onCancel={ this.onCloseModal } width={ 782 }>
          <EditForm
            people={ currentPeople }
            closeModal={ this.onCloseModal }
            isAdd={ isAdd }
            type={ isAdd ? 'POST' : 'PUT' }
          />
        </Modal>
      </Card>
    );
  }

  private onRowClick = (state: any, rowInfo: RowInfo, column: any) => ({
    onClick: () => this.setState({ currentPeople: rowInfo.original, modalVisible: true, isAdd: false }),
    style: { cursor: 'pointer' },
  });

  private onCloseModal = () => this.setState({ modalVisible: false });

  private onOpenAddModal = () => this.setState({ isAdd: true, modalVisible: true });
}

const mapStateToProps = (state: IReducers) => {
  return {
    people: getPeople(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    getPeople: () => dispatch(PeopleAPI.getPeople()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(People);
