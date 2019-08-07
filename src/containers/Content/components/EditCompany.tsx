import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Card, Form, Button, Popconfirm } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { EnumTarget, EnumType, ICompany, ICompanyGroup, ICompanyJoin, IContainer } from 'react-cms';
import { get } from 'lodash';
import { UploadFile } from 'antd/lib/upload/interface';
import { EditorState, ContentState } from 'draft-js';

import { IReducers } from '../../../redux';
import { ContentAPI } from '../api/content';
import { getContainer, getMenuData } from '../../../redux/common/common.selector';

import AutoComplete from '../../../components/Autocomplete/Autocomplete';
import { MenuEditListApi } from '../../../components/MenuEditList/api/menuEditList';
import CheckBox from '../../../components/CheckBox/CheckBox';
import { Editor } from 'react-draft-wysiwyg';

interface IProps extends FormComponentProps {
  entity: ICompanyJoin | null;
  closeModal: () => void;
  container?: IContainer;
  isAdd?: boolean;
  type?: EnumType;
  companies?: ICompany[];
  companiesGroups?: ICompanyGroup[];
  getContainer?: (id: number) => void;
  updateContainer?: (id: number, action: string, data: object, cb?: () => void) => void;
  getMenuData?: (enumTarget: EnumTarget) => void;
}

interface IState {
  imageUrl: string;
  file: UploadFile;
  editorState: EditorState;
}

class EditCompany extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    type: 'PUT',
    isAdd: false,
    companies: [],
    companiesGroups: [],
  };

  constructor(props: IProps) {
    super(props);

    this.state = {
      imageUrl: null,
      file: null,
      editorState: null,
    };
  }

  public componentDidMount() {
    const { getMenuData, isAdd, entity } = this.props;

    if (!isAdd) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(get(entity, 'description', ''))),
      });
    }

    getMenuData('people');
    getMenuData('people_groups');
  }

  public componentDidUpdate(prevState: IProps) {
    const { entity, isAdd } = this.props;

    if (prevState.entity !== null) {
      if (!isAdd && entity.description !== prevState.entity.description) {

        this.setState({
          editorState: EditorState.createWithContent(ContentState.createFromText(get(entity, 'description', ''))),
        });
      }
    }
  }

  public render(): JSX.Element {
    const { entity, form, isAdd, companies, companiesGroups } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Card
        title={ !isAdd ? get(entity, 'name', '') : 'Добавление компании' }
        style={ !isAdd ?{ top: 40, position: 'relative' } : { top: 0, position: 'relative' } }
      >
        <Form>
          <Card
            title={ 'Основное' }
            extra={ (
              <Form.Item>
                { getFieldDecorator('visible', {
                  initialValue: !isAdd ? Boolean(entity.visible) : true,
                })(
                  <CheckBox text={ 'Видимость' } />,
                ) }
              </Form.Item>
            ) }
          >
            <Form.Item label={ 'Название' }>
              { getFieldDecorator('name', {
                rules: [{ required: isAdd, message: isAdd ? 'Введите значение' : undefined }],
                initialValue: !isAdd ? get(entity, 'companyName', '') : '',
              })(
                <AutoComplete placeholder={ 'Название' } data={ companies.map(item => item.name) } />,
              ) }
            </Form.Item>

            <Form.Item label={ 'Группа' }>
              { getFieldDecorator('group', {
                rules: [{ required: isAdd, message: isAdd ? 'Введите значение' : undefined }],
                initialValue: !isAdd ? get(entity, 'companyGroupName', '') : '',
              })(
                <AutoComplete placeholder={ 'Группа' } data={ companiesGroups.map(item => item.name) } />,
              ) }
            </Form.Item>
          </Card>

          <br />

          <Card title={ 'Описание' }>
            <Editor
              toolbarClassName={ 'toolbarClassName' }
              wrapperClassName={ 'wrapperClassName' }
              editorClassName={ 'editorClassName' }
              localization={ { locale: 'ru' } }
              editorState={ this.state.editorState }
              onEditorStateChange={ this.onChangeText }
            />
          </Card>

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
            style={ { position: 'relative', left: isAdd ? 630 : 542 } }
          >
            { isAdd ? 'Добавить' : 'Сохранить' }
          </Button>
        </Form>
      </Card>
    );
  }

  private onChangeText = (editorState: EditorState) => this.setState({ editorState });

  private onSubmit = () => {
    const { container, isAdd, entity, companies, companiesGroups, closeModal, form, updateContainer } = this.props;

    form.validateFields((errors, values) => {
      if (!errors) {
        const company: ICompany = companies.find((company: ICompany) => company.name.toLowerCase() === values.name.toLowerCase());
        const group: ICompanyGroup = companiesGroups.find((group: ICompanyGroup) => group.name.toLowerCase() === values.group.toLowerCase());

        updateContainer(
          container.id,
          isAdd ? 'new' : 'edit',
          {
            ...values,
            id: get(entity, 'id', undefined),
            company_id: get(company, 'id', ''),
            company_group: 0,
            // company_group: get(group, 'id', ''),
            visible: +values.visible,
            description: this.state.editorState.getCurrentContent().getPlainText(),
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
    const { container, entity, updateContainer, closeModal } = this.props;

    updateContainer(
      container.id,
      'delete',
      { id: entity.id, action: 'delete' },
      closeModal,
    );
  };
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
    updateContainer(id: number, action: string, data: object, cb?: () => void) {
      dispatch(ContentAPI.updateContainer(id, action, data, cb));
    },
    getMenuData: (enumTarget: EnumTarget) => dispatch(MenuEditListApi.getMenuData(enumTarget)),
    getContainer: (id: number) => dispatch(ContentAPI.getContainer(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(EditCompany));
