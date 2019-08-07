import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Row, Col, Switch, Card, Button, Modal } from 'antd';
import { IContainer, INews } from 'react-cms';
import { get } from 'lodash';
import { Column, RowInfo } from 'react-table';
import ReactTable from 'react-table';
import * as moment from 'moment';

import { DATE_FORMAT } from '../../../service/Consts/Consts';
import { IReducers } from '../../../redux';
import { ContentAPI } from '../api/content';
import { getContainer } from '../../../redux/common/common.selector';

import FakeImg from '../../../components/FakeImg/FakeImg';
import EditNews from './EditNews';
import b from '../../../service/Utils/b';

interface IProps {
  container?: IContainer;
}

interface IState {
  modalVisible: boolean;
  isAdd: boolean;
  currentEntity: INews | null;
  currentIndex: number;
}

class ModuleNews extends React.Component<IProps, IState> {
  private static columns: Column[] = [
    {
      Header: 'Картинка',
      accessor: 'img',
      Cell: (cellInfo: RowInfo) => {
        const image: string = get(cellInfo, 'original.img');

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
                      : <FakeImg style={ { left: 0 } } />
                  }
                </React.Fragment>
              </Col>
              <Col span={ 12 } style={ { margin: '0 0 0 -8px', padding: 0 } }>
                <p style={ { fontWeight: 'bold' } }>{ cellInfo.original.title }</p>
                <p style={ { margin: 0 } }>{ cellInfo.original.announceShort }</p>
              </Col>
            </Row >
          </div >
        );
      },
      style: {
        width: 'fit-content',
      },
    },
    {
      Header: 'Содержание',
      accessor: 'bodyShort',
    },
    {
      Header: 'Видимость',
      accessor: 'visible',
      Cell: (cellInfo: RowInfo) => (
        <Switch
          checked={ Boolean(get(cellInfo, 'original.visible', 1)) }
          className={ b('content', 'program-table-switch-position') }
        />
      ),
      width: 100,
    },
    {
      Header: 'Обновлено',
      accessor: 'time',
      Cell: (cellInfo: RowInfo) => (
        <div style={ { display: 'flex', flexDirection: 'column', textAlign: 'right' } }>
          <span>{ cellInfo.original.time.slice(0, 10) }</span>
          <span>{ cellInfo.original.time.slice(10, 16) }</span>
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

  public render(): JSX.Element {
    const { container: { data, isLoading } } = this.props;
    const { isAdd, modalVisible, currentEntity } = this.state;

    return (
      <Card
        title={ <Button icon={ 'plus' } onClick={ this.onOpenAddModal } type={ 'primary' } >Добавить новость</Button> }
      >
        <ReactTable
          data={ data.map((item: INews) => ({
            ...item,
            time: moment.unix(item.time).format(DATE_FORMAT),
            announceShort: item.announce.slice(0, 200),
            bodyShort: item.body.slice(0, 200),
            visible: Boolean(item.visible) ? 'Да' : 'Нет',
          })) }
          columns={ ModuleNews.columns }
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
          <EditNews
            index={ 0 }
            data={ currentEntity }
            closeModal={ this.onCloseModal }
            isAdd={ isAdd }
          />
        </Modal>
      </Card>
    );
  }

  private onCloseModal = () => this.setState({ modalVisible: false });

  private onOpenAddModal = () => this.setState({ isAdd: true, modalVisible: true });

  private onRowClick = (state: any, rowInfo: RowInfo, column: any) => ({
    onClick: () => this.setState({
      currentIndex: rowInfo.index,
      currentEntity: rowInfo.original,
      modalVisible: true,
      isAdd: false,
    }),
    style: { cursor: 'pointer' },
  });
}

const mapStateToProps = (state: IReducers) => {
  return {
    container: getContainer(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    updateContainer: (id: number, action: string, data: object, cb?: () => void) => dispatch(ContentAPI.updateContainer(id, action, data, cb)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModuleNews);
