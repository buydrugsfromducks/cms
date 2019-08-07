import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Card, Form, Button, DatePicker, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { EnumTarget, IContainer, ILocation, IUser, UploadType } from 'react-cms';
import { get } from 'lodash';
import { UploadFile } from 'antd/lib/upload/interface';
import { EditorState, ContentState } from 'draft-js';

import { IReducers } from '../../../redux';
import { ContentAPI } from '../api/content';
import { getContainer, getMenuData } from '../../../redux/common/common.selector';

import AutoComplete from '../../../components/Autocomplete/Autocomplete';
import { MenuEditListApi } from '../../../components/MenuEditList/api/menuEditList';
import Input from '../../../components/Input/Input';
import * as moment from 'moment';
import { DATE_FORMAT } from '../../../service/Consts/Consts';
import CheckBox from '../../../components/CheckBox/CheckBox';
import { Editor } from 'react-draft-wysiwyg';

interface IProps extends FormComponentProps {
  closeModal: () => void;
  user?: IUser;
  locations?: ILocation[];
  container?: IContainer;
  getContainer?: (id: number) => void;
  updateContainer?: (id: number, action: string, data: object, cb?: () => void) => void;
  uploadImage?: (data: UploadFile, uploadType: UploadType, cb?: (url: string[]) => void) => void;
  getMenuData?: (enumTarget: EnumTarget) => void;
}

interface IState {
  editorState: EditorState;
}

class AddProgram extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    locations: [],
  };

  constructor(props: IProps) {
    super(props);

    this.state = {
      editorState: null,
    };
  }

  public componentDidMount() {
    const {getMenuData} = this.props;

    getMenuData('people');
    getMenuData('people_groups');
  }

  public render(): JSX.Element {
    const {form, locations} = this.props;
    const {getFieldDecorator} = form;

    return (
      <Card>
        <Form>
          <Card title={ 'Основное' }>
            <Form.Item label={ 'Название' }>
              { getFieldDecorator('title', {
                rules: [{ required: true, message: 'Введите значение' }],
              })(
                <Input placeholder={ 'Название' } />,
              ) }
            </Form.Item>

            <Form.Item label={ 'Адрес' }>
              { getFieldDecorator('location', {
                rules: [{ required: true, message: 'Введите значение' }],
              })(
                <AutoComplete placeholder={ 'Адрес' } data={ locations.map(item => item.name) } />,
              ) }
            </Form.Item>
          </Card>

          <br />

          <Card title={ 'Время' }>
            <Row>
              <Col span={ 11 }>
                <Form.Item label={ 'Начало' }>
                  { getFieldDecorator('start', {
                    rules: [{ required: false }],
                    initialValue: moment(),
                  })(
                    <DatePicker
                      format={ DATE_FORMAT }
                      onChange={ this.onSetEndDate }
                      showTime={ { format: 'HH:mm' } }
                    />,
                  ) }
                </Form.Item>
              </Col>

              <Col span={ 11 } offset={ 2 }>
                <Form.Item label={ 'Конец' }>
                  { getFieldDecorator('finish', {
                    rules: [{ required: false }],
                    initialValue: moment().add({hour: 1}),
                  })(
                    <DatePicker format={ DATE_FORMAT } showTime={ { format: 'HH:mm' } } />,
                  ) }
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label={ 'Есть дата окончания?' }>
              { getFieldDecorator('isFinish', {
                rules: [{ required: false }],
                initialValue: false,
              })(
                <CheckBox />,
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

          <Button type={ 'primary' } onClick={ this.onSubmit }>
            Добавить
          </Button>
        </Form>
      </Card>
    );
  }

  private onChangeText = (editorState: EditorState) => this.setState({editorState});

  private onSubmit = () => {
    const {container, closeModal, form, updateContainer, locations, user} = this.props;

    form.validateFields((errors, values) => {
      if (!errors) {
        const location: ILocation = locations.find(item => item.name.toLowerCase() === values.location.toLowerCase());

        updateContainer(
          container.id,
          'new',
          {
            ...values,
            location_id: get(location, 'id', null),
            location_name: get(location, 'name', null),
            start: moment(values.start, DATE_FORMAT).subtract({hour: user.appdata.eventTimeShift}).unix(),
            finish: !values.isFinish ? 0 : moment(values.finish, DATE_FORMAT).subtract({hour: user.appdata.eventTimeShift}).unix(),
            inviteonly: 0,
            visible: 1,
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

  private onSetEndDate = (date: moment.Moment, dateString: string) => {
    const {form} = this.props;
    form.setFieldsValue({finish: moment(dateString, DATE_FORMAT).add({hour: 1})});
  };
}

const mapStateToProps = (state: IReducers) => {
  return {
    container: getContainer(state),
    locations: getMenuData(state, 'locations'),
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

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(AddProgram));
