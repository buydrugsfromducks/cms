import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Button, Card, Col, DatePicker, Form, Icon, Modal, notification, Popconfirm, Popover, Row, Switch, TimePicker } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { EnumTarget, IContainer, ILocation, INews, IPeople, IProgramModule, IProgramModulePeople, IUser, UploadType } from 'react-cms';
import { get } from 'lodash';
import { UploadFile } from 'antd/lib/upload/interface';
import * as moment from 'moment';
import styled from 'styled-components';
import { ContentState, EditorState } from 'draft-js';

import { IReducers } from '../../../redux';
import { ContentAPI } from '../api/content';
import { getContainer, getMenuData } from '../../../redux/common/common.selector';
import { DATE_FORMAT, ONLY_DATE_FORMAT, ONLY_TIME_FORMAT } from '../../../service/Consts/Consts';

import AutoComplete from '../../../components/Autocomplete/Autocomplete';
import { MenuEditListApi } from '../../../components/MenuEditList/api/menuEditList';
import Input from '../../../components/Input/Input';
import EditForm from '../../Locations/components/EditForm';
import { Editor } from 'react-draft-wysiwyg';
import WrapperCard from '../../../components/FormCard/WrapperCard';
import FormBlockCard from '../../../components/FormCard/FormBlockCard';
import FakeImg from '../../../components/FakeImg/FakeImg';
import { VisibleFormLabel } from '../../../themes/Common';
import { setCurrentEntity } from '../../../redux/common/common.reducer';
import { Moment } from 'moment';

const PeopleCardWrapper = styled.div`
  .ant-form-item {
    margin: 0;
  }
`;

const PeopleNameWrapper = styled.span`
  position: relative;
  left: 20px;
  top: -22px;
  font-size: 18px;
  font-weight: bold;
`;

interface IProps extends FormComponentProps {
  entity: IProgramModule;
  closeModal: () => void;
  user?: IUser;
  isAdd?: boolean;
  locations?: ILocation[];
  people?: IPeople[];
  peopleGroups?: any[];
  container?: IContainer;

  getContainer?: (id: number) => Promise<void>;
  updateContainer?: (id: number, action: string, data: object, cb?: () => void) => void;
  uploadImage?: (data: UploadFile, uploadType: UploadType, cb?: (url: string[]) => void) => void;
  getMenuData?: (enumTarget: EnumTarget) => void;
  setCurrentEntity?: (entity) => void;
}

interface IState {
  isAddLocationsVisible: boolean;
  editorState: EditorState;
}

class EditProgram extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    locations: [],
    people: [],
    peopleGroups: [],
    isAdd: true,
  };

  constructor(props: IProps) {
    super(props);

    this.state = {
      isAddLocationsVisible: false,
      editorState: null,
    };
  }

  public componentDidUpdate(prevState: IProps) {
    const { entity } = this.props;
    if (get(entity, 'description', '') !== get(prevState.entity, 'description', '')) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(get(entity, 'description', ''))),
      });
    }
  }

  public componentDidMount() {
    const { getMenuData, entity } = this.props;

    getMenuData('people');
    getMenuData('people_groups');

    this.setState({
      editorState: EditorState.createWithContent(ContentState.createFromText(get(entity, 'description', ''))),
    });
  }

  public render(): JSX.Element {
    const { user, entity, form, locations, isAdd, people } = this.props;
    const { isAddLocationsVisible } = this.state;
    const { getFieldDecorator } = form;

    const entityPeoples: IProgramModulePeople[] = get(entity, 'peoples', []);
    const isStart: boolean = !Boolean(get(entity, 'finish', 0));
    console.log(entityPeoples);
    console.log('entityPeoples');

    return (
      <React.Fragment>
        <WrapperCard
          isAdd={ isAdd }
          title={ isAdd ? 'Добавить программу' : get(entity, 'title', '') }
        >
          <Form>
            <FormBlockCard
              title={ 'Основное' }
              extra={ (
                <React.Fragment>
                  <VisibleFormLabel>Видимость </VisibleFormLabel>
                  <Form.Item style={ { zIndex: 9999 } }>
                    { getFieldDecorator('visible', {
                      rules: [{ required: false }],
                      initialValue: Boolean(get(entity, 'visible', 1)),
                      valuePropName: 'checked',
                    })(
                      <Switch />,
                    ) }
                  </Form.Item>
                </React.Fragment>
              ) }
              bodyStyle={ { position: 'relative', top: -22, height: 180 } }
            >
              <Form.Item label={ 'Название' }>
                { getFieldDecorator('title', {
                  rules: [{ required: true, message: 'Введите значение' }],
                  initialValue: get(entity, 'title', ''),
                })(
                  <Input placeholder={ 'Название' } />,
                ) }
              </Form.Item>

              <Row>
                <Col span={ 23 }>
                  <Form.Item label={ 'Адрес' }>
                    { getFieldDecorator('location', {
                      rules: [{ required: false }],
                      initialValue: get(entity, 'location_name', ''),
                    })(
                      <AutoComplete
                        placeholder={ 'Адрес' }
                        data={
                          locations
                            .map(item => item.name)
                            .filter((item: any, index: any, self: { indexOf: (arg0: any) => void; }) => self.indexOf(item) === index) } />,
                    ) }
                  </Form.Item>
                </Col>

                <Col span={ 1 }>
                  <div style={ { position: 'relative', top: 42 } }>
                    <Popover content={ 'Добавить' }>
                      <Button
                        icon={ 'plus' }
                        type={ 'primary' }
                        onClick={ this.onToggleVisibleAddLocation }
                        style={ { height: 30, top: 2, borderRadius: 0 } }
                      />
                    </Popover>
                  </div>
                </Col>
              </Row>
            </FormBlockCard>

            <br />

            <FormBlockCard title={ 'Время' } bodyStyle={ { height: 86 } }>
              <Row>
                <Col span={ 5 }>
                  <Form.Item>
                    { getFieldDecorator('start', {
                      rules: [{ required: false }],
                      initialValue: get(entity, 'start', null)
                        ? moment.unix(get(entity, 'start', 0)).add({ hour: user.appdata.eventTimeShift }).utc()
                        : null,
                    })(
                      <DatePicker
                        format={ ONLY_DATE_FORMAT }
                        style={ { width: '100%' } }
                        placeholder={ 'Дата' }
                        onChange={ this.onPickStartDate }
                      />,
                    ) }
                  </Form.Item>
                </Col>

                <Col span={ 3 }>
                  <Form.Item>
                    { getFieldDecorator('start_time', {
                      rules: [{ required: false }],
                      initialValue: get(entity, 'start', null)
                        ? moment.unix(get(entity, 'start', 0)).add({ hour: user.appdata.eventTimeShift }).utc()
                        : null,
                    })(
                      <TimePicker
                        format={ ONLY_TIME_FORMAT }
                        style={ { width: '100%' } }
                        placeholder={ 'Время' }
                      />,
                    ) }
                  </Form.Item>
                </Col>

                <Col span={ 5 } offset={ 1 }>
                  <Form.Item>
                    { getFieldDecorator('finish', {
                      rules: [{ required: false }],
                      initialValue: isStart
                        ? undefined
                        : moment.unix(get(entity, 'finish')).add({ hour: user.appdata.eventTimeShift }).utc(),
                    })(
                      <DatePicker
                        format={ ONLY_DATE_FORMAT }
                        style={ { width: '100%' } }
                        placeholder={ 'Дата' }
                      />,
                    ) }
                  </Form.Item>
                </Col>

                <Col span={ 3 }>
                  <Form.Item>
                    { getFieldDecorator('finish_time', {
                      rules: [{ required: false }],
                      initialValue: isStart
                        ? undefined
                        : moment.unix(get(entity, 'finish')).add({ hour: user.appdata.eventTimeShift }).utc(),
                    })(
                      <TimePicker
                        format={ ONLY_TIME_FORMAT }
                        style={ { width: '100%' } }
                        placeholder={ 'Время' }
                      />,
                    ) }
                  </Form.Item>
                </Col>

                <Col span={ 6 } offset={ 1 }>
                  <Form.Item label={ 'Только начало' } style={ { position: 'relative', top: -30 } }>
                    { getFieldDecorator('isStart', {
                      rules: [{ required: false }],
                      initialValue: isStart,
                      valuePropName: 'checked',
                    })(
                      <Switch />,
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
              !isAdd && (
                <FormBlockCard title={ 'Люди' }>
                  <PeopleCardWrapper>
                    <Form.Item>
                      { getFieldDecorator('newPeople', {
                        rules: [{ required: false }],
                      })(
                        <AutoComplete
                          placeholder={ 'Начните вводить имя' }
                          data={ people.map(item => item.name).filter(item => !entityPeoples.find(man => man.name === item)) }
                          prefixAddon={ <Icon type={ 'search' } /> }
                          style={ { width: '100%' } }
                          onPick={ this.peopleAdd }
                        />,
                      ) }
                    </Form.Item>

                    <hr />

                    {
                      entityPeoples.map((item, index) => (
                        <Card key={ index } style={ { height: 60 } }>
                          {
                            item.img.includes('http')
                              ? <img src={ item.img } width={ 40 } style={ { position: 'relative', top: -14 } } />
                              : <div style={ { display: 'inline-block', position: 'relative', top: -14 , verticalAlign: 'middle' } }>
                                  <FakeImg style={ { left: 0 } } />
                                </div>
                              
                          }

                          <PeopleNameWrapper>{ item.name }</PeopleNameWrapper>

                          <Popconfirm
                            title={ 'Вы уверены?' }
                            okText={ 'Да' }
                            cancelText={ 'Нет' }
                            placement={ 'bottom' }
                            onConfirm={ this.deletePeople(+item.id) }
                          >
                            <Button 
                              type={ 'danger' }
                              icon={ 'close' }
                              style={ { position: 'absolute', right: 15, top: 14 } }
                            />
                          </Popconfirm>
                        </Card>
                      ))
                    }
                  </PeopleCardWrapper>
                </FormBlockCard>
              )
            }

            <br />

            {
              !isAdd && <Popconfirm
                title={ 'Вы уверены?' }
                onConfirm={ this.delete(get(entity, 'id', null)) }
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
              Сохранить
            </Button>
          </Form>
        </WrapperCard>

        <Modal
          visible={ isAddLocationsVisible }
          footer={ null }
          width={ 782 }
          onCancel={ this.onToggleVisibleAddLocation }
        >
          <EditForm
            entity={ null }
            closeModal={ this.onToggleVisibleAddLocation }
            type={ 'POST' }
            isAdd
          />
        </Modal>
      </React.Fragment>
    );
  }

  private onChangeText = (editorState: EditorState) => this.setState({ editorState });

  private deletePeople = (peopleId: number) => () => {
    const { container: { id }, entity, getContainer, updateContainer, setCurrentEntity } = this.props;

    updateContainer(
      id,
      'people_del',
      {
        id: get(entity, 'id', null),
        people_id: peopleId,
        people_group: 1,
      },
      () => {
        notification.success({ message: 'Успешно удален', description: '' });
        getContainer(id)
          .then((json: any) => setCurrentEntity(json.data.find(item => item.id === entity.id)));
      },
    );
  };

  private peopleAdd = (name: string) => {
    const { container: { id }, entity, updateContainer, getContainer, setCurrentEntity, people, form } = this.props;

    updateContainer(
      id,
      'people_add',
      {
        id: get(entity, 'id', null),
        people_id: get(people.find(man => man.name === name), 'id', null),
        people_group: 1,
      },
      () => {
        notification.success({ message: 'Успешно добавлен', description: '' });
        getContainer(id)
          .then((json: any) => {
            setCurrentEntity(json.data.find(item => item.id === entity.id));
            form.setFieldsValue({ newPeople: '' });
          });
      },
    );
  };

  private peopleSetGroup = (peopleId: number) => (value: string) => {
    const { container: { id }, entity, form, updateContainer, peopleGroups, closeModal } = this.props;

    updateContainer(
      id,
      'people_set_group',
      {
        id: entity.id,
        people_id: peopleId,
        people_group: get(peopleGroups.find(item => item.name === value), 'id', null),
      },
      () => {
        notification.success({ message: 'Успешно добавлен', description: '' });
        closeModal();
        form.resetFields();
      },
    );
  };

  private onSubmit = () => {
    const { entity, container, closeModal, form, updateContainer, locations, user } = this.props;

    form.validateFields((errors, values) => {
      if (!errors) {
        const location: ILocation = locations.find(item => item.name.toLowerCase() === values.location.toLowerCase());
        const id: number | undefined = get(entity, 'id');

        updateContainer(
          container.id,
          id ? 'edit' : 'new',
          {
            ...values,
            location_id: get(location, 'id', -1),
            location_name: get(location, 'name', values.location),
            start: moment(`${values.start.format(ONLY_DATE_FORMAT)} ${values.start_time.format(ONLY_TIME_FORMAT)}`, DATE_FORMAT)
              .subtract({ hour: user.appdata.eventTimeShift })
              .unix(),
            finish: values.isStart
              ? 0
              : moment(`${values.finish.format(ONLY_DATE_FORMAT)} ${values.finish_time.format(ONLY_TIME_FORMAT)}`, DATE_FORMAT)
                .subtract({ hour: user.appdata.eventTimeShift })
                .unix(),
            finish_time: values.isStart
              ? 0
              : moment(`${values.finish.format(ONLY_DATE_FORMAT)} ${values.finish_time.format(ONLY_TIME_FORMAT)}`, DATE_FORMAT)
                .subtract({ hour: user.appdata.eventTimeShift })
                .unix(),
            inviteonly: 0,
            visible: +values.visible,
            id,
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

  private delete = (id: number) => () => {
    const { container, updateContainer, closeModal } = this.props;
    updateContainer(container.id, 'delete', { id }, closeModal);
  };

  private onToggleVisibleAddLocation = () => this.setState({ isAddLocationsVisible: !this.state.isAddLocationsVisible });

  private onPickStartDate = (date: Moment, dateString: string) => {
    const { form } = this.props;
    const isStart: boolean = form.getFieldValue('isStart');

    if (!isStart) {
      form.setFieldsValue({ finish: moment(dateString, ONLY_DATE_FORMAT) });
    }
  };
}

const mapStateToProps = (state: IReducers) => {
  return {
    container: getContainer(state),
    locations: getMenuData(state, 'locations'),
    people: getMenuData(state, 'people'),
    peopleGroups: getMenuData(state, 'people_groups'),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    updateContainer(id: number, action: string, data: object, cb?: () => void) {
      return dispatch(ContentAPI.updateContainer(id, action, data, cb));
    },
    getMenuData: (enumTarget: EnumTarget) => dispatch(MenuEditListApi.getMenuData(enumTarget)),
    getContainer: (id: number) => dispatch(ContentAPI.getContainer(id)),
    setCurrentEntity: entity => dispatch(setCurrentEntity(entity)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(EditProgram));
