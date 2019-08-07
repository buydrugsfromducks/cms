import * as React from 'react';
import { connect } from 'react-redux';
import { Card, Select, Form, Button, DatePicker, Popconfirm, Switch } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { IContainer, INews } from 'react-cms';
import { get } from 'lodash';
import { Dispatch } from 'redux';
import AutoComplete from '../../../components/Autocomplete/Autocomplete';
import { EditorState, ContentState } from 'draft-js';

import { IReducers } from '../../../redux';
import { ContentAPI } from '../api/content';
import { getContainer } from '../../../redux/common/common.selector';

import Input from '../../../components/Input/Input';
import WrapperCard from '../../../components/FormCard/WrapperCard';

const { Option } = Select;

interface IProps extends FormComponentProps {
	index: number;
	container?: IContainer;
	data: INews | null;
	closeModal: () => void;
	isAdd?: boolean;
	updateContainer?: (id: number, action: string, data: object, cb?: () => void) => void;
	updatePoll?: any;
	result?: any;
}

interface IState {
	editorState: EditorState;
}

class EditNews extends React.Component<IProps, IState> {
	public static defaultProps: Partial<IProps> = {
		isAdd: false,
	};

	constructor(props: IProps) {
		super(props);

		this.state = {
			editorState: null,
		};
	}

	public componentDidMount() {
		const { data, isAdd } = this.props;
		if (!isAdd) {
			this.setState({
				editorState: EditorState.createWithContent(ContentState.createFromText(get(data, 'body', ''))),
			});
		}
	}

	public componentDidUpdate(prevState: IProps) {
		const { data, isAdd } = this.props;
		if (!isAdd && get(data, 'body', '') !== get(prevState, 'data.body', '')) {
			this.setState({
				editorState: EditorState.createWithContent(ContentState.createFromText(get(data, 'body', ''))),
			});
		}
	}

	public render(): JSX.Element {
		const { data, form, isAdd, result } = this.props;
		const { getFieldDecorator } = form;
		console.log(result);

		return (
			<WrapperCard
				style={ { paddingTop: 10, border: 0 } }
				title={ !isAdd ? get(data, 'name', '') : 'Добавление новости' }
				isAdd={ isAdd }
			>
				<Form>
					{
						isAdd
							? <Card title={ 'Основное' }>
								<Form.Item label={ 'Видимость' }>
									{ getFieldDecorator('visible', {
										rules: [{ required: true, message: 'Введите значение' }],
										initialValue: !isAdd ? get(data, 'title', '') : '',
									})(
										<Switch></Switch>,
									) }
								</Form.Item>

								<Form.Item label={ 'Название' }>
									{ getFieldDecorator('name', {
										rules: [{ required: true, message: 'Введите значение' }],
										initialValue: !isAdd ? get(data, 'name', '') : '',
									})(
										<Input placeholder={ 'Название' } />,
									) }
								</Form.Item>

								<Form.Item label={ 'Статус' }>
									{ getFieldDecorator('enabled', {
										rules: [{ required: true, message: 'Введите значение' }],
										initialValue: !isAdd ? get(data, 'enabled', '') : '',
									})(
										<Select>
											<Option key={ '0' }>Не активен</Option>
											<Option key={ '1' }>Идет опрос</Option>
											<Option key={ '2' }>Опрос завершен</Option>
										</Select>,
									) }
								</Form.Item>
							</Card>
							// {
							// 	"action": "new_question",
							// 	"name": "Как дела?",
							// 	"multi_select": 1,
							// 	"max_select": 1,
							// 	"min_select": 1,
							// 	"sid": 1
							// }
							
							: result
								? <Card title={ 'Основное' }>
									<Form.Item label={ 'Мульти селект' }>
										{ getFieldDecorator('multi_select', {
											rules: [{ required: true, message: 'Введите значение' }],
											initialValue: !isAdd ? get(data, 'title', '') : '',
										})(
											<Input placeholder={ '1' } />,
										) }
									</Form.Item>

									<Form.Item label={ 'Макс селект' }>
										{ getFieldDecorator('max_select', {
											rules: [{ required: true, message: 'Введите значение' }],
											initialValue: !isAdd ? get(data, 'title', '') : '',
										})(
											<Input placeholder={ '1' } />,
										) }
									</Form.Item>

									<Form.Item label={ 'Мин селект' }>
										{ getFieldDecorator('min_select', {
											rules: [{ required: true, message: 'Введите значение' }],
											initialValue: !isAdd ? get(data, 'title', '') : '',
										})(
											<Input placeholder={ '1' } />,
										) }
									</Form.Item>

									<Form.Item label={ 'Название' }>
										{ getFieldDecorator('name', {
											rules: [{ required: false, message: 'Введите значение' }],
											initialValue: '',
										})(
											<Input placeholder={ 'Название вопроса' } />,
										) }
									</Form.Item>
								</Card>
								: <Card title={ 'Основное' }>
									<Form.Item label={ 'Видимость' }>
										{ getFieldDecorator('enabled', {
											rules: [{ required: true, message: 'Введите значение' }],
											initialValue: !isAdd ? get(data, 'title', '') : '',
										})(
											<Switch></Switch>,
										) }
									</Form.Item>

									<Form.Item label={ 'Стиль' }>
										{ getFieldDecorator('style', {
											rules: [{ required: true, message: 'Введите значение' }],
											initialValue: !isAdd ? get(data, 'title', '') : '',
										})(
											<Select>
												<Option key={ '1' }>Вопросы на странице</Option>
												<Option key={ '2' }>Вопросы лентой</Option>
											</Select>,
										) }
									</Form.Item>

									<Form.Item label={ 'Требуется ли авторизации' }>
										{ getFieldDecorator('needAuth', {
											rules: [{ required: true, message: 'Введите значение' }],
											initialValue: !isAdd ? get(data, 'title', '') : '',
										})(
											<Switch></Switch>,
										) }
									</Form.Item>

									<Form.Item label={ 'Название' }>
										{ getFieldDecorator('name', {
											rules: [{ required: false, message: 'Введите значение' }],
											initialValue: !isAdd ? get(data, 'name', '') : '',
										})(
											<Input placeholder={ 'Название' } />,
										) }
									</Form.Item>
								</Card>
					}

					<br />

					{
						!isAdd && <Popconfirm
							title={ 'Вы уверены?' }
							onConfirm={ this.delete(get(data, 'id', null)) }
							okText={ 'Да' }
							cancelText={ 'Нет' }
							placement={ 'bottom' }
						>
							<Button type={ 'danger' }>Удалить</Button>
						</Popconfirm>
					}

					<Button
						type={ 'primary' }
						onClick={ this.onSubmit }
						style={ { position: 'relative', left: isAdd ? 630 : 542 } }
					>
						{ isAdd ? 'Добавить' : 'Сохранить' }
					</Button>
				</Form>
			</WrapperCard>
		);
	}

	private onSubmit = () => {
		const { container, updateContainer, updatePoll, closeModal, form, isAdd, result } = this.props;
		console.log(this.props);

		form.validateFields((errors, values) => {
			if (!errors) {
				values = {
					...values,
				};
				console.log(values);

				result
					? updateContainer(
						container.id,
						isAdd ? 'new_question' : 'edit_question',
						isAdd ? { ...values, visible: 1 } : values,
						closeModal,
					)
					: updateContainer(
						container.id,
						isAdd ? 'new' : 'edit',
						isAdd ? { ...values, visible: 1 } : values,
						closeModal,
					);
				form.resetFields();
			}
		});
	};

	private delete = (id: number) => () => {
		const { container, updateContainer, closeModal } = this.props;
		updateContainer(container.id, 'delete', { id }, closeModal);
	};
}

const mapStateToProps = (state: IReducers) => {
	return {
		container: getContainer(state),
	};
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
	return {
		updateContainer: (id: number, action: string, data: object, cb?: () => void) => dispatch(ContentAPI.updateContainer(id, action, data, cb)),
		updatePoll: (id: number, action: string, data: object, cb?: () => void) => dispatch(ContentAPI.updatePoll(id, action, data, cb)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(EditNews));
