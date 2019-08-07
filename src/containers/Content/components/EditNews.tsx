import * as React from 'react';
import { connect } from 'react-redux';
import { Card, Form, Button, DatePicker, Popconfirm } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { IContainer, INews } from 'react-cms';
import { get } from 'lodash';
import * as moment from 'moment';
import { Dispatch } from 'redux';
import { EditorState, ContentState } from 'draft-js';

import { IReducers } from '../../../redux';
import { DATE_FORMAT } from '../../../service/Consts/Consts';
import { ContentAPI } from '../api/content';
import { getContainer } from '../../../redux/common/common.selector';

import Input from '../../../components/Input/Input';
import { Editor } from 'react-draft-wysiwyg';
import WrapperCard from '../../../components/FormCard/WrapperCard';

interface IProps extends FormComponentProps {
  index: number;
  container?: IContainer;
  data: INews | null;
  closeModal: () => void;
  isAdd?: boolean;
  updateContainer?: (id: number, action: string, data: object, cb?: () => void) => void;
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
    const {data, isAdd} = this.props;
    if (!isAdd) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(get(data, 'body', ''))),
      });
    }
  }

  public componentDidUpdate(prevState: IProps) {
    const {data, isAdd} = this.props;
    if (!isAdd && get(data, 'body', '') !== get(prevState, 'data.body', '')) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(get(data, 'body', ''))),
      });
    }
  }

  public render(): JSX.Element {
    const { data, form, isAdd } = this.props;
    const { getFieldDecorator } = form;

    return (
      <WrapperCard
        style={ { paddingTop: 10, border: 0 } }
        title={ !isAdd ? get(data, 'name', '') : 'Добавление новости' }
        isAdd={ isAdd }
      >
        <Form>
          <Card title={ 'Основное' }>

          <Form.Item label={ 'Дата' }>
              { getFieldDecorator('time', {
                rules: [{ required: true, message: 'Введите значение' }],
                initialValue: !isAdd
                  ? moment(data.time, DATE_FORMAT)
                  : moment(),
              })(
                <DatePicker format={ DATE_FORMAT } />,
              ) }
            </Form.Item>

            <Form.Item label={ 'Заголовок' }>
              { getFieldDecorator('title', {
                rules: [{ required: true, message: 'Введите значение' }],
                initialValue: !isAdd ? get(data, 'title', '') : '',
              })(
                <Input placeholder={ 'Заголовок' } />,
              ) }
            </Form.Item>

            <Form.Item label={ 'Анонс' }>
              { getFieldDecorator('announce', {
                rules: [{ required: true, message: 'Введите значение' }],
                initialValue: !isAdd ? get(data, 'announce', '') : '',
              })(
                <Input placeholder={ 'Анонс' } textArea />,
              ) }
            </Form.Item>

            <Form.Item label={ 'Фото' }>
              { getFieldDecorator('img', {
                rules: [{ required: true, message: 'Введите значение' }],
                initialValue: !isAdd ? get(data, 'img', '') : '',
              })(
                <Input placeholder={ 'Фото' } />,
              ) }
            </Form.Item>

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
            style={ {position: 'relative', left: isAdd ? 630 : 542} }
          >
            { isAdd ? 'Добавить' : 'Сохранить' }
          </Button>
        </Form>
      </WrapperCard>
    );
  }

  private onChangeText = (editorState: EditorState) => this.setState({editorState});

  private onSubmit = () => {
    const {container, updateContainer, closeModal, form, isAdd} = this.props;

    form.validateFields((errors, values) => {
      if (!errors) {
        values = {
          ...values,
          time: moment(values.time, DATE_FORMAT).unix(),
          body: this.state.editorState.getCurrentContent().getPlainText(),
        };

        updateContainer(
          container.id,
          isAdd ? 'new' : 'edit',
          isAdd ? {...values, visible: 1} : values,
          closeModal,
        );
        form.resetFields();
      }
    });
  };

  private delete = (id: number) => () => {
    const {container, updateContainer, closeModal} = this.props;
    updateContainer(container.id, 'delete', {id}, closeModal);
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(EditNews));
