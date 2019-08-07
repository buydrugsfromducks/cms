import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Layout, notification, Form, Icon, Input } from 'antd';

import { FormComponentProps } from 'antd/lib/form';

import { IReducers } from '../../redux';
import { AuthApi } from '../../redux/auth/auth.api';

const { Sider } = Layout;

interface IProps extends FormComponentProps {
    getStates?: () => IReducers;
    login?: () => void;
    signup?: () => void;
    toRegistration?: () => void;
    match?: any;
    location?: any;
}

class Login extends React.Component<IProps> {

    constructor(props: IProps) {
        super(props);
    }

    public render(): JSX.Element {
        const { getFieldDecorator } = this.props.form;

        return (
            <Sider width={ 450 } style={ { display: 'block', background: '#fff', margin: '0 auto', borderRadius: 15, padding: 30, textAlign: 'start', boxShadow: '1px 2px 3px -1px rgba(50, 50, 50, 0.69)' } }>
                <div style={ { width: 312, display: 'block', margin: '0 auto' } }>
                    <h1 style={ { fontSize: '1.2em', margin: '0px auto 8px 0px' } }>Вход</h1>
                    <Form onSubmit={ this.handleSubmit } className='login-form' style={ { textAlign: 'center' } }>
                        <Form.Item>
                            { getFieldDecorator('login', {
                                rules: [{ required: true, message: 'Пожалуйста, введите номер телефона!' }],
                            })(
                                <Input
                                    prefix={ <Icon type='user' style={ { color: 'rgba(0,0,0,.25)' } } /> }
                                    placeholder='Телефон' size='large'
                                />,
                            ) }
                        </Form.Item>
                        <Form.Item>
                            { getFieldDecorator('password', {
                                rules: [{ required: true, message: 'Пожалуйста, введите пароль!' }],
                            })(
                                <Input
                                    prefix={ <Icon type='lock' style={ { color: 'rgba(0,0,0,.25)' } } /> }
                                    type='password' size='large'
                                    placeholder='Пароль'
                                />,
                            ) }
                        </Form.Item>
                        <Form.Item>
                            <Button style={ { border: 0, background: 'transparent', boxShadow: 'unset' } } onClick={ this.remindPass }>
                                Забыли пароль?
                            </Button>
                            <Button style={ { width: '100%' } } type='primary' htmlType='submit' className='login-form-button'>
                                Войти
                            </Button>
                            <a onClick={ this.handleSignUp }>Или зарегистрироваться сейчас!</a>
                        </Form.Item>
                    </Form>
                </div>
            </Sider>
        );
    }

    private handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                const obj = { login: values.login, password: values.password };
                //@ts-ignore
                return this.props.login(obj);

            }
        });
    };

    private handleSignUp = () => {
        return this.props.toRegistration();
    }

    private remindPass = () => {
        notification.warning({ message: 'Такого еще нет', description: 'Скоро будет' });
    }
}

const mapDispatchToProps = {
    login: AuthApi.login,
    toRegistration: AuthApi.toRegistration,
};

export default connect(null, mapDispatchToProps)(Form.create()(Login));
