import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Card, Form, Button, Popconfirm, Upload, Icon, Col, Row, Switch } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { EnumTarget, EnumType, ICompany, UploadType } from 'react-cms';
import { get } from 'lodash';
import { UploadFile } from 'antd/lib/upload/interface';
import { EditorState, ContentState } from 'draft-js';

import Input from '../../../components/Input/Input';

import { IReducers } from '../../../redux';
import { PeopleAPI } from '../../People/api/people';
import { MenuEditListApi } from '../../../components/MenuEditList/api/menuEditList';
import { Editor } from 'react-draft-wysiwyg';
import Uploader from '../../../components/Uploader/Uploader';
import { AntColUpperWrapper, VisibleFormLabel } from '../../../themes/Common';
import WrapperCard from '../../../components/FormCard/WrapperCard';

interface IProps extends FormComponentProps {
  people: ICompany | null;
  closeModal: () => void;
  isAdd?: boolean;
  type?: EnumType;
  getMenuData?: (enumTarget: EnumTarget) => void;
  updateEnum?: (id: number, enumType: EnumType, enumTarget: EnumTarget, data: object, cb?: () => void) => void;
  uploadImage?: (data: UploadFile[], uploadType: UploadType, cb?: (url: string[]) => void) => void;
}

interface IState {
  imageUrl: string;
  file: UploadFile;
  editorState: EditorState;
}

class EditForm extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    type: 'PUT',
    isAdd: false,
  };

  constructor(props: IProps) {
    super(props);

    this.state = {
      imageUrl: get(this.props.people, 'img', null),
      file: get(this.props.people, 'img', null),
      editorState: null,
    };
  }

  public componentDidMount() {
    const {people, isAdd} = this.props;
    if (!isAdd) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(get(people, 'description', ''))),
      });
    }
  }

  public componentDidUpdate(prevState: IProps) {
    const {people, isAdd} = this.props;
    if (!isAdd && get(people, 'description', '') !== get(prevState.people, 'description', '')) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(get(people, 'description', ''))),
      });
    }
  }

  public render(): JSX.Element {
    const {people, form, isAdd} = this.props;
    const {getFieldDecorator} = form;

    return (
      <AntColUpperWrapper>
        <WrapperCard
          title={ !isAdd ? get(people, 'name', '') : 'Добавление компании' }
          isAdd={ isAdd }
        >
          <Form>
            <Card
              title={ 'Основное' }
              extra={ (
                <React.Fragment>
                  <VisibleFormLabel>Видимость </VisibleFormLabel>
                  <Form.Item style={ {zIndex: 9999} }>
                    { getFieldDecorator('visible', {
                      rules: [{required: false}],
                      initialValue: Boolean(get(people, 'visible', 1)),
                      valuePropName: 'checked',
                    })(
                      <Switch />,
                    ) }
                  </Form.Item>
                </React.Fragment>
              ) }
            >
              <Row>
                <Col span={ 6 }>
                  <Uploader
                    files={ [this.state.file].filter(item => !!item) }
                    beforeUploadFile={ this.beforeUploadFile }
                    onRemove={ this.removeFile }
                    imageUrl={ this.state.imageUrl }
                  />
                </Col>

                <Col span={ 17 } offset={ 1 }>
                  <Form.Item label={ 'Название' }>
                    { getFieldDecorator('name', {
                      rules: [{ required: true, message: 'Введите значение' }],
                      initialValue: !isAdd ? get(people, 'name', '') : '',
                    })(
                      <Input placeholder={ 'Название' } />,
                    ) }
                  </Form.Item>

                  <Form.Item label={ 'Аннонс' }>
                    { getFieldDecorator('announce', {
                      rules: [{ required: false }],
                      initialValue: !isAdd ? get(people, 'announce', '') : '',
                    })(
                      <Input placeholder={ 'Аннонс' } textArea />,
                    ) }
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <br />

            <Card title={ 'Описание' }>
              <Editor
                toolbarClassName={ 'toolbarClassName' }
                wrapperClassName={ 'wrapperClassName' }
                editorClassName={ 'editorClassName' }
                localization={ {locale: 'ru'} }
                editorState={ this.state.editorState }
                onEditorStateChange={ this.onChangeText }
              />
            </Card>

            <br />

            {
              !isAdd && <Popconfirm
                title={ 'Вы уверены?' }
                onConfirm={ this.delete(get(people, 'id', null)) }
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
        </WrapperCard>
      </AntColUpperWrapper>
    );
  }

  private onChangeText = (editorState: EditorState) => this.setState({editorState});

  private onSubmit = () => {
    const {people, type, closeModal, form, updateEnum, getMenuData} = this.props;

    form.validateFields((errors, values) => {
      if (!errors) {
        updateEnum(
          get(people, 'id', null),
          type,
          'company',
          {
            ...values,
            img: this.state.imageUrl,
            description: this.state.editorState.getCurrentContent().getPlainText(),
            visible: +values.visible,
          },
          () => {
            closeModal();
            getMenuData('company');
          },
        );
        form.resetFields();
      }
    });
  };

  private delete = (id: number) => () => this.props.updateEnum(id, 'DELETE', 'company', {}, () => {
    const {closeModal, getMenuData} = this.props;
    closeModal();
    getMenuData('company');
  });

  private onUploadImage = (file: UploadFile) => this.props.uploadImage(
    [file],
    'company',
    (urls: string[]) => this.setState({imageUrl: urls[0]}),
  );

  private removeFile = () => this.setState({file: null});

  private beforeUploadFile = (file: UploadFile) => {
    this.setState({file});
    this.onUploadImage(file);
    return false;
  };
}

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    updateEnum(id: number, enumType: EnumType, enumTarget: EnumTarget, data: object, cb?: () => void) {
      dispatch(PeopleAPI.updateEnum(id, enumType, enumTarget, data, cb));
    },
    getMenuData: (enumTarget: EnumTarget) => dispatch(MenuEditListApi.getMenuData(enumTarget)),
    uploadImage: (data: UploadFile[], uploadType: UploadType, cb?: (url: string[]) => void) => dispatch(PeopleAPI.uploadImage(data, uploadType, cb)),
  };
};

export default connect(null, mapDispatchToProps)(Form.create()(EditForm));
