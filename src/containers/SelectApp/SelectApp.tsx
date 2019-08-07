import * as React from 'react';
import { compose, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Select, Card, Icon, Input, Form, Button, Modal, DatePicker } from 'antd';

import { FormComponentProps } from 'antd/lib/form';
import { range } from 'lodash';
import { IAppsList, IUser } from 'react-cms';
import { withRouter } from 'react-router-dom';
import { DATE_FORMAT } from '../../service/Consts/Consts';

import { IReducers } from '../../redux';
import { AppsAPI } from './api/select-app';
import { getApps } from '../../redux/common/common.selector';

import { getUserData } from '../../redux/auth/auth.selector';
import b from '../../service/Utils/b';

import './Apps.scss';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface IProps extends FormComponentProps {
  user?: IUser;
  apps?: IAppsList[];
  getApps?: () => void;
}

interface IState {
  modalVisible: boolean;
}

class SelectApp extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
  }

  public componentWillMount() {
    this.setState({
      modalVisible: false,
    });
  }

  private static rowsNumber: number = 3;

  private onSelectApp = (id: number) => {
    //@ts-ignore
    return Promise.resolve(this.props.selectApps(id));
  };

  public componentDidMount() {
    const { getApps } = this.props;
    getApps();
  }

  public render(): JSX.Element {
    const { apps, user } = this.props;
    const { getFieldDecorator } = this.props.form;

    // Creates array [-11, -10, ... ,10, 11]
    const times = Array.from({ length: 23 }, (_, i) => i - 11);

    if (!apps.some(item => item.id === -1)) {
      apps.push({ ...apps[0], id: -1 });
    }

    const rows: number = Math.ceil(apps.length / SelectApp.rowsNumber);
    let currentIndex: number = 0;

    return (
      <>
        <Card style={ { height: '100%', overflowY: 'scroll' } }>
          <h1>Мои приложения</h1>
          <div className='content-wraper' >
            {
              range(0, rows).map(index => (
                <div className={ b('apps', 'parent') } key={ index }>
                  {
                    range(0, SelectApp.rowsNumber).map(columnIndex => {
                      if (currentIndex === apps.length) {
                        return <React.Fragment key={ `no_${columnIndex}` } />;
                      }

                      const event: any = apps[currentIndex];
                      currentIndex += 1;
                      const cardData: JSX.Element = (
                        <Card
                          className={ b('apps', 'child') }
                          onClick={ () => this.onSelectApp(event.id) }
                        >
                          <Card.Meta
                            title={ event.name }
                          />
                          <div className={ b('apps','icon-wraper') } >
                            <Icon
                              type={ 'caret-right' }
                              style={ {
                                position: 'relative',
                                transform: 'translateY(-50%) scale(3, 3)',
                                top: 26,
                                left: 26,
                              } }
                            />
                          </div>
                          <span style={ { position: 'relative', top: 60 } } >{ event.event_name || 'Нет названия' }</span>
                        </Card>
                      );

                      return (
                        <React.Fragment key={ `column_${columnIndex}` }>
                          {
                            event.id !== -1
                              ? cardData
                              : (
                                <Card
                                  className={ b('apps', 'child') }
                                  style={ {
                                    textAlign: 'center',
                                    boxShadow: ' 1px 2px 3px 0px rgba(50, 50, 50, 0.69)',
                                    MozBoxShadow: '1px 2px 3px -1px rgba(50, 50, 50, 0.69)',
                                  } }
                                  onClick={ this.onOpenModal }
                                >
                                  <Card.Meta
                                    title={ 'Создать приложение' }
                                  />
                                  <div className={ b('apps','icon-wraper') } >
                                    <Icon
                                      type={ 'plus' }
                                      style={ {
                                        position: 'relative',
                                        transform: 'translateY(-50%) scale(3, 3)',
                                        top: 26,
                                      } }
                                    />
                                  </div>
                                  <span style={ { position: 'relative', top: 60, opacity: 0 } } >{ event.event_name || 'Добавить' }</span>
                                </Card>
                              )
                          }
                        </React.Fragment>
                      );
                    })
                  }
            </div>
            ))
          }
          </div>
        </Card>
        {
          !!this.state.modalVisible
            ? <Modal
              style={ { top: 395, zIndex: 999 } }
              title='Создать приложение'
              visible={ this.state.modalVisible }
              onCancel={ this.onCloseModal }
              onOk={ this.handleSubmit }
              footer={ [
                <Button key='back' onClick={ this.onCloseModal }>
                  Вернуться
                </Button>,
                <Button key='submit' type='primary' onClick={ this.handleSubmit }>
                  Создать приложение
                </Button>,
              ] }
            >
              <div style={ { display: 'flex', justifyContent: 'center' } }>
                <Form onSubmit={ this.handleSubmit } className='login-form' style={ { minWidth: 300 } }>
                  <Form.Item>
                    { getFieldDecorator('event_name', {
                      rules: [{ required: true, message: 'Пожалуйста, введите номер телефона!' }],
                    })(
                      <Input
                        style={ { marginTop: 20 } }
                        prefix={ <Icon type='file-done' style={ { color: 'rgba(0,0,0,.25)' } } /> }
                        placeholder='Название' size='large'
                      />,
                    ) }
                  </Form.Item>
                  <Form.Item label='Дата проведения события'>
                    { getFieldDecorator('date', {
                      rules: [{ required: true, message: 'Пожалуйста, введите время события!' }],
                    })(
                      <RangePicker
                        showTime
                        style={ { width: 300 } }
                        format={ DATE_FORMAT }
                      />,
                    ) }
                  </Form.Item>
                  <Form.Item label='Временная зона'>
                    { getFieldDecorator('timezone', {
                      initialValue: 0,
                      rules: [{ required: true, message: 'Пожалуйста, введите временную зону!' }],
                    })(
                      <Select placeholder='Временная зона' style={ { width: 300 } }>
                        {
                          times.map(item => {
                            return (<Option key={ item }>{ item }</Option>);
                          })
                        }
                      </Select>,
                    ) }
                  </Form.Item>
                  <Form.Item label='Локация'>
                    { getFieldDecorator('location', {
                      initialValue: 0,
                      rules: [{ required: true, message: 'Пожалуйста, введите локацию!' }],
                    })(
                      <Input
                        style={ { width: 300 } }
                        prefix={ <Icon type='picture' style={ { color: 'rgba(0,0,0,.25)' } } /> }
                        placeholder='Локация' size='large'
                      />,
                    ) }
                  </Form.Item>
                </Form>
              </div>
            </Modal>
            : null
        }
      </>
    );
  }

  private onCloseModal = () => this.setState({ modalVisible: false });

  private onOpenModal = () => this.setState({ modalVisible: true });

  private handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const obj = {
          event_name: values.event_name,
          start_time: values.date[0].unix(),
          end_time: values.date[1].unix(),
          timezone: values.timezone,
          location: values.location,
        };
        this.setState({ modalVisible: false });
        console.log('Received values of form: ', obj);
        //@ts-ignore 
        return this.props.newApp(obj);
      }
    });
  };
}

const mapStateToProps = (state: IReducers) => {
  return {
    apps: getApps(state),
    user: getUserData(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    getApps: () => dispatch(AppsAPI.getApps()),
    selectApps: (app: number) => dispatch(AppsAPI.selectApps(app)),
    newApp: (app: number) => dispatch(AppsAPI.newApp(app)),
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Form.create()(SelectApp));
