import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Form, Button, Row, Col, Switch, Popconfirm } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { EnumTarget, EnumType, IPeople, UploadType } from 'react-cms';
import { get } from 'lodash';
import { UploadFile } from 'antd/lib/upload/interface';
import { EditorState, ContentState } from 'draft-js';

import Input from '../../../components/Input/Input';

import { IReducers } from '../../../redux';
import { PeopleAPI } from '../api/people';
import { Editor } from 'react-draft-wysiwyg';
import Uploader from '../../../components/Uploader/Uploader';
import WrapperCard from '../../../components/FormCard/WrapperCard';
import FormBlockCard from '../../../components/FormCard/FormBlockCard';
import { AntColUpperWrapper, VisibleFormLabel } from '../../../themes/Common';

interface IProps extends FormComponentProps {
  people: IPeople | null;
  closeModal: () => void;
  isAdd?: boolean;
  type?: EnumType;
  getPeople?: () => void;
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
    const { people, isAdd } = this.props;
    if (!isAdd) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(get(people, 'description', ''))),
      });
    }
  }

  public componentDidUpdate(prevState: Readonly<IProps>) {
    const { people, isAdd } = this.props;

    if (!isAdd && get(people, 'description', '') !== get(prevState.people, 'description', '')) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(get(people, 'description', ''))),
      });
    }

    if (people !== null && prevState.people !== null) {
      if (get(this.props.people, 'img', null) !== prevState.people.img) {
        this.setState({
          imageUrl: get(this.props.people, 'img', null),
          file: get(this.props.people, 'img', null),
        });
      }
    }
  }

  public render(): JSX.Element {
    const { people, form, isAdd } = this.props;
    const { getFieldDecorator } = form;

    return (
      <WrapperCard
        title={ !isAdd ? get(people, 'name', '') : 'Добавление спонсора' }
        isAdd={ isAdd }
      >
        <AntColUpperWrapper>
          <Form>
            <FormBlockCard
              title={ 'Основное' }
              extra={ (
                <React.Fragment>
                  <VisibleFormLabel>Видимость </VisibleFormLabel>
                  <Form.Item style={ { zIndex: 9999 } }>
                    { getFieldDecorator('visible', {
                      rules: [{ required: false }],
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
                  <Form.Item label={ 'Имя' }>
                    { getFieldDecorator('name', {
                      rules: [{ required: true, message: 'Введите значение' }],
                      initialValue: !isAdd ? get(people, 'name', '') : '',
                    })(
                      <Input placeholder={ 'Имя' } />,
                    ) }
                  </Form.Item>

                  <Form.Item label={ 'Телефон' }>
                    { getFieldDecorator('mobile', {
                      rules: [{ required: true, message: 'Введите значение' }],
                      initialValue: !isAdd ? get(people, 'mobile', '') : '',
                    })(
                      <Input placeholder={ 'Телефон' } />,
                    ) }
                  </Form.Item>

                  <Form.Item label={ 'Subtitle' }>
                    { getFieldDecorator('subtitle', {
                      rules: [{ required: false }],
                      initialValue: !isAdd ? get(people, 'subtitle', '') : '',
                    })(
                      <Input placeholder={ 'Subtitle' } />,
                    ) }
                  </Form.Item>
                </Col>
              </Row>
            </FormBlockCard>

            <br />

            <FormBlockCard title={ 'Описание' }>
              <Editor
                toolbarClassName={ 'toolbarClassName' }
                wrapperClassName={ 'wrapperClassName' }
                editorClassName={ 'editorClassName' }
                localization={ { locale: 'ru' } }
                editorState={ this.state.editorState }
                onEditorStateChange={ this.onChangeText }
              />
            </FormBlockCard>

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
              style={ { position: 'relative', left: isAdd ? 630 : 542 } }
            >
              { isAdd ? 'Добавить' : 'Сохранить' }
            </Button>
          </Form>
        </AntColUpperWrapper>
      </WrapperCard>
    );
  }

  private onChangeText = (editorState: EditorState) => this.setState({ editorState });

  private onSubmit = () => {
    const { people, type, closeModal, form, updateEnum, getPeople } = this.props;

    form.validateFields((errors, values) => {
      if (!errors) {
        updateEnum(
          get(people, 'id', null),
          type,
          'people',
          {
            ...values,
            img: this.state.imageUrl,
            description: this.state.editorState.getCurrentContent().getPlainText(),
            visible: +values.visible,
          },
          () => {
            closeModal();
            getPeople();
          },
        );
        form.resetFields();
      }
    });
  };

  private delete = (id: number) => () => this.props.updateEnum(id, 'DELETE', 'people', {}, () => {
    const { closeModal, getPeople } = this.props;

    closeModal();
    getPeople();
  });

  private onUploadImage = (file: UploadFile) => this.props.uploadImage(
    [file],
    'people',
    (urls: string[]) => this.setState({ imageUrl: urls[0] }),
  );

  private removeFile = () => this.setState({ file: null });

  private beforeUploadFile = (file: UploadFile) => {
    this.setState({ file });
    this.onUploadImage(file);
    return false;
  };
}

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    updateEnum(id: number, enumType: EnumType, enumTarget: EnumTarget, data: object, cb?: () => void) {
      dispatch(PeopleAPI.updateEnum(id, enumType, enumTarget, data, cb));
    },
    getPeople: () => dispatch(PeopleAPI.getPeople()),
    uploadImage: (data: UploadFile[], uploadType: UploadType, cb?: (url: string[]) => void) => dispatch(PeopleAPI.uploadImage(data, uploadType, cb)),
  };
};

export default connect(null, mapDispatchToProps)(Form.create()(EditForm));
