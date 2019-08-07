import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Col, Switch, Card, Button, Modal } from 'antd';
import { IContainer, INews } from 'react-cms';
import { get } from 'lodash';
import { Column, RowInfo } from 'react-table';
import ReactTable from 'react-table';
import * as moment from 'moment';

import { DATE_FORMAT } from '../../../service/Consts/Consts';
import { IReducers } from '../../../redux';
import { ContentAPI } from '../api/content';
import { getContainer } from '../../../redux/common/common.selector';

import EditPoll from './EditPoll';
import b from '../../../service/Utils/b';

interface IProps {
	container?: IContainer;
}

interface IState {
	modalVisible: boolean;
	isAdd: boolean;
	result: boolean;
	currentEntity: INews | null;
	currentIndex: number;
}

class ModuleNews extends React.Component<IProps, IState> {
	private static columns: Column[] = [
		{
			Header: 'Название',
			accessor: 'title',
			Cell: (cellInfo: RowInfo) => {
				return (
					<div>
						<Col span={ 12 } style={ { margin: 0, padding: 0 } }>
							<p style={ { fontWeight: 'bold' } }>{ cellInfo.original.name }</p>
						</Col>
					</div>
				);
			},
		},
		{
			Header: 'Статус',
			accessor: 'enabled',
			Cell: (cellInfo: RowInfo) => {
				const statuses: string[] = ['Не активен', 'Идет опрос', 'Опрос завершен'];

				return (
					<div>
						<Col span={ 12 } style={ { margin: 0, padding: 0 } }>
							<p>
								{
									statuses[cellInfo.original.enabled]
								}
							</p>
						</Col>
					</div>
				);
			},
			width: 100,
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
			Header: 'Результаты',
			accessor: 'results',
			Cell: (cellInfo: RowInfo) => {
				return (
					<Button
					//onClick={(e) => onResultClick(e)}
					>Результаты</Button>
				);
			},
			width: 112,
			className: 'results',
		},
		{
			Header: 'Обновлен',
			accessor: 'time',
			Cell: (cellInfo: RowInfo) => (
				<div style={ { display: 'flex', flexDirection: 'column', textAlign: 'right' } }>
					<p style={ { margin: 0 } }>{ cellInfo.original.time.slice(0, 10) }</p>
					<p>{ cellInfo.original.time.slice(10, 16) }</p>
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
			result: false,
			currentEntity: null,
			currentIndex: 0,
		};
	}

	public render(): JSX.Element {
		const { container: { data, isLoading } } = this.props;
		console.log(this.props);
		const { isAdd, modalVisible, currentEntity, result } = this.state;

		return (
			<Card
				title={ <Button icon={ 'plus' } onClick={ this.onOpenAddModal } type={ 'primary' }>Добавить опрос</Button> }
			>
				<ReactTable
					data={ data.map((item: any) => ({
						...item,
						name: item.name,
						enabled: item.enabled,
						time: moment.unix(item.updated_at).format(DATE_FORMAT),
						visible: Boolean(item.visible) ? 'Да' : 'Нет',
					})) }
					columns={ ModuleNews.columns }
					pageSize={ data.length }
					noDataText={ 'Нет информации' }
					loadingText={ 'Загрузка...' }
					loading={ isLoading }
					className={ '-striped -highlight' }
					getTrProps={ this.onRowClick }
					getTdProps={ this.onTdClick }
					showPagination={ false }
					resizable={ false }
					style={ { color: '#000000', maxHeight: '85vh' } }
				/>

				<Modal visible={ modalVisible } footer={ null } onCancel={ this.onCloseModal } width={ 782 }>
					<EditPoll
						index={ 0 }
						data={ currentEntity }
						closeModal={ this.onCloseModal }
						isAdd={ isAdd }
						result={ result }
					/>
				</Modal>
			</Card>
		);
	}

	private onCloseModal = () => this.setState({ modalVisible: false });

	private onOpenAddModal = () => this.setState({ isAdd: true, modalVisible: true });

	private onRowClick = (state: any, rowInfo: RowInfo, column: any) => ({
		onClick:e => {
			this.setState({
				currentIndex: rowInfo.index,
				currentEntity: rowInfo.original,
				modalVisible: true,
				result: false,
				isAdd: false,
			});
		},
		style: { cursor: 'pointer' },
	});

	private onTdClick = (state: any, rowInfo: RowInfo, column: any) => ({
		onClick:e => {
			if (e.currentTarget.className === 'rt-td results') {
				e.stopPropagation();
				this.setState({
					currentIndex: rowInfo.index,
					currentEntity: rowInfo.original,
					result: true,
					modalVisible: true,
					isAdd: false,
				});
			}
		},
	})
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
