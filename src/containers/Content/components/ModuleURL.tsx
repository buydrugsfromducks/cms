import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Card, Form, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { IContainer } from 'react-cms';
import { get } from 'lodash';

import { IReducers } from '../../../redux';
import { ContentAPI } from '../api/content';
import { getContainer } from '../../../redux/common/common.selector';

import Input from '../../../components/Input/Input';

interface IProps extends FormComponentProps {
  container?: IContainer;
  updateContainer?: (id: number, action: string, data: object) => void;
}

class ModuleURL extends React.Component<IProps> {
  public render(): JSX.Element {
    const {container: {data}, form} = this.props;
    const {getFieldDecorator} = form;

    return (
      <Card>
        <Form>
          <Form.Item style={ {display: 'none'} }>
            { getFieldDecorator('action', {
              rules: [{ required: false }],
              initialValue: 'edit',
            })(<Input />) }
          </Form.Item>

          <Form.Item>
            { getFieldDecorator('data', {
              rules: [{ required: true, message: 'Введите значение' }],
              initialValue: data.data,
            })(<Input placeholder={ 'URL' } />) }
          </Form.Item>

          <Button onClick={ this.onUpdate } type={ 'primary' }>Сохранить</Button>
        </Form>
      </Card>
    );
  }

  private onUpdate = () => {
    const {form, container, updateContainer} = this.props;

    form.validateFields((errors, values) => {
      if (!errors) {
        updateContainer(container.id, get(values, 'action', 'edit'), values);
      }
    });
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

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(ModuleURL));
