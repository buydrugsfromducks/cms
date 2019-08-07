import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Row, Col, Switch, Card, Button, Modal } from 'antd';
import { EnumTarget, IContainer, ICompanyList, ICompany, ICompanyGroup, ICompanyJoin } from 'react-cms';
import { get } from 'lodash';
import { Column, RowInfo } from 'react-table';
import ReactTable from 'react-table';
import * as moment from 'moment';

import { DATE_FORMAT } from '../../../service/Consts/Consts';
import { IReducers } from '../../../redux';
import { ContentAPI } from '../api/content';
import { getContainer, getMenuData } from '../../../redux/common/common.selector';

import { MenuEditListApi } from '../../../components/MenuEditList/api/menuEditList';
import FakeImg from '../../../components/FakeImg/FakeImg';
import EditCompany from './EditCompany';

interface IProps {
  container?: IContainer;
  getMenuData?: (enumTarget: EnumTarget) => void;
  companies?: ICompany[];
  companiesGroups?: ICompanyGroup[];
}

interface IState {
  modalVisible: boolean;
  isAdd: boolean;
  currentEntity: ICompanyJoin | null;
  currentIndex: number;
}

class ModuleCompanies extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    companies: [],
    companiesGroups: [],
  };
  private static columns: Column[] = [
    {
      Header: 'Название',
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
                      : <FakeImg />
                  }
                </React.Fragment>
              </Col>
              <Col span={ 12 } style={ { margin: 0, padding: 0 } }>
                <p style={ { fontWeight: 'bold' } }>{ cellInfo.original.companyName }</p>
                <p style={ { margin: 0 } }>{ cellInfo.original.announce }</p>
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
      Header: 'Группа компании',
      accessor: 'companyGroupName',
      width: 200,
    },
    {
      Header: 'Видимость',
      accessor: 'visible',
      Cell: (cellInfo: RowInfo) => (
        <Switch
          checked={ Boolean(get(cellInfo, 'original.visible', 1)) }
          className='content__program-table-switch-position'
        />
      ),
      width: 100,
    },
    {
      Header: 'Обновлено',
      accessor: 'time',
      Cell: (cellInfo: RowInfo) => {
        console.log(cellInfo);
        const time: string = moment.unix(cellInfo.original.updated_at).format(DATE_FORMAT);

        return (
          <div style={ { display: 'flex', flexDirection: 'column', textAlign: 'right' } }>
            <span>{ time.slice(0, 10) }</span>
            <span>{ time.slice(10, 16) }</span>
          </div>
        );
      },
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

    getMenuData('company');
    getMenuData('company_groups');
  }

  public render(): JSX.Element {
    const { container: { data, isLoading }, companies, companiesGroups } = this.props;
    const { modalVisible, isAdd, currentEntity } = this.state;
    console.log(this.props);

    return (
      <Card
        title={ <Button icon={ 'plus' } onClick={ this.onOpenAddModal } type={ 'primary' }>Добавить</Button> }
      >
        <ReactTable
          data={ data.map((item: ICompanyList) => {
            const company: ICompany = companies.find((company: ICompany) => company.id === item.company_id);
            const group: ICompanyGroup = companiesGroups.find((group: ICompanyGroup) => group.id === item.company_group);

            return ({
              ...item,
              img: get(company, 'img', ''),
              companyName: get(company, 'name', ''),
              companyGroupName: get(group, 'name', ''),
              announce: get(company, 'announce', '').slice(0, 200),
              description: get(company, 'description', '').slice(0, 200),
              announceFull: get(company, 'announce', ''),
              updated_at: get(company, 'updated_at', ''),
              descriptionFull: get(company, 'description', ''),
              visible: Boolean(item.visible) ? 'Да' : 'Нет',
            });
          }) }
          columns={ ModuleCompanies.columns }
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
          <EditCompany
            entity={ currentEntity }
            closeModal={ this.onCloseModal }
            isAdd={ isAdd }
            type={ isAdd ? 'POST' : 'PUT' }
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
    companies: getMenuData(state, 'company'),
    companiesGroups: getMenuData(state, 'company_groups'),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    updateContainer: (id: number, action: string, data: object, cb?: () => void) => dispatch(ContentAPI.updateContainer(id, action, data, cb)),
    getMenuData: (enumTarget: EnumTarget) => dispatch(MenuEditListApi.getMenuData(enumTarget)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModuleCompanies);
