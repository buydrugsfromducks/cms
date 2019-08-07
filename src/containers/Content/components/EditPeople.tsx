import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Card, Form, Button, Popconfirm } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { EnumTarget, EnumType, IContainer, IPeopleList, UploadType } from 'react-cms';
import { get } from 'lodash';
import { UploadFile } from 'antd/lib/upload/interface';

import { IReducers } from '../../../redux';
import { ContentAPI } from '../api/content';
import { getContainer, getMenuData } from '../../../redux/common/common.selector';

import AutoComplete from '../../../components/Autocomplete/Autocomplete';
import { MenuEditListApi } from '../../../components/MenuEditList/api/menuEditList';
import CheckBox from '../../../components/CheckBox/CheckBox';

interface IProps extends FormComponentProps {
  people: IPeopleList | null;
  closeModal: () => void;
  container?: IContainer;
  isAdd?: boolean;
  type?: EnumType;
  menuDataPeople?: any[];
  menuDataPeopleGroups?: any[];
  getContainer?: (id: number) => void;
  updateContainer?: (id: number, action: string, data: object, cb?: () => void) => void;
  uploadImage?: (data: UploadFile, uploadType: UploadType, cb?: (url: string[]) => void) => void;
  getMenuData?: (enumTarget: EnumTarget) => void;
}

interface IState {
  imageUrl: string;
  file: UploadFile;
}

class EditPeople extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    type: 'PUT',
    isAdd: false,
    menuDataPeople: [],
    menuDataPeopleGroups: [],
  };

  constructor(props: IProps) {
    super(props);

    this.state = {
      imageUrl: null,
      file: null,
    };
  }

  public componentDidMount() {
    const {getMenuData} = this.props;

    getMenuData('people');
    getMenuData('people_groups');
  }

  public render(): JSX.Element {
    const {people, form, isAdd, menuDataPeople, menuDataPeopleGroups} = this.props;
    const {getFieldDecorator} = form;

    return (
      <Card
        title={ !isAdd ? get(people, 'name', '') : null }
      >
        <Form>
          <Form.Item label={ 'Человек' }>
            { getFieldDecorator('people', {
              rules: [{ required: isAdd, message: isAdd ? 'Введите значение' : undefined }],
              initialValue: !isAdd ? get(people, 'peopleName', '') : '',
            })(
              <AutoComplete placeholder={ 'Человек' } data={ menuDataPeople.map((item: { name: string; }) => item.name) } />,
            ) }
          </Form.Item>

          <Form.Item label={ 'Группа' }>
            { getFieldDecorator('group', {
              rules: [{ required: isAdd, message: isAdd ? 'Введите значение' : undefined }],
              initialValue: !isAdd ? get(people, 'people_group_name', '') : '',
            })(
              <AutoComplete placeholder={ 'Группа' } data={ menuDataPeopleGroups.map((item: { name: string; }) => item.name) } />,
            ) }
          </Form.Item>

          <Form.Item>
            { getFieldDecorator('visible', {
              initialValue: !isAdd ? Boolean(people.visible) : false,
            })(
              <CheckBox text={ 'Видимость' } />,
            ) }
          </Form.Item>

          <br />

          {
            !isAdd && <Popconfirm
              title={ 'Вы уверены?' }
              onConfirm={ this.delete() }
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
            style={ {position: 'relative', left: isAdd ? 630 : 542} }
          >
            { isAdd ? 'Добавить' : 'Сохранить' }
          </Button>
        </Form>
      </Card>
    );
  }

  private onSubmit = () => {
    const {container, isAdd, people, menuDataPeople, menuDataPeopleGroups, closeModal, form, updateContainer} = this.props;

    form.validateFields((errors, values) => {
      if (!errors) {
        updateContainer(
          container.id,
          isAdd ? 'new' : 'edit',
          {
            ...values,
            people_id: get(
              menuDataPeople.find((item: { name: string; }) => item.name.toLowerCase() === values.people.toLowerCase()),
              'id',
              null,
            ),
            people_group: get(
              menuDataPeopleGroups.find((item: { name: string; }) => item.name.toLowerCase() === values.group.toLowerCase()),
              'id',
              null,
            ),
            id: !isAdd ? people.id : undefined,
          },
          () => {
            closeModal();
          },
        );
        form.resetFields();
      }
    });
  };

  private delete = () => () => {
    const {container, people, updateContainer, closeModal} = this.props;

    updateContainer(
      container.id,
      'delete',
      { id: people.id, action: 'delete' },
      closeModal,
    );
  };
}

const mapStateToProps = (state: IReducers) => {
  return {
    menuDataPeople: getMenuData(state, 'people'),
    menuDataPeopleGroups: getMenuData(state, 'people_groups'),
    container: getContainer(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    updateContainer(id: number, action: string, data: object, cb?: () => void) {
      dispatch(ContentAPI.updateContainer(id, action, data, cb));
    },
    getMenuData: (enumTarget: EnumTarget) => dispatch(MenuEditListApi.getMenuData(enumTarget)),
    getContainer: (id: number) => dispatch(ContentAPI.getContainer(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(EditPeople));
