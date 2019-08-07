import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Form, Button, Row, Col, Switch, Popconfirm } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { EnumTarget, EnumType, ILocation } from 'react-cms';
import { get } from 'lodash';
import { YMaps, Map, Placemark } from 'react-yandex-maps';
import { EditorState, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import styled from 'styled-components';

import { PeopleAPI } from '../../People/api/people';
import { IReducers } from '../../../redux';
import { COORDS_MOSCOW } from '../../../service/Consts/Consts';

import Input from '../../../components/Input/Input';
import { MenuEditListApi } from '../../../components/MenuEditList/api/menuEditList';
import Uploader from '../../../components/Uploader/Uploader';
import AutoComplete from '../../../components/Autocomplete/Autocomplete';
import WrapperCard from '../../../components/FormCard/WrapperCard';
import FormBlockCard from '../../../components/FormCard/FormBlockCard';
import { AntColUpperWrapper, VisibleFormLabel } from '../../../themes/Common';

const TextAreaWrapper = styled.div`
  .ant-form-item-label {
    top: 10px !important;
  }
`;

const GeneralCardWrapper = styled.div`
  .ant-card-head-wrapper {
    height: 20px;
  }
  
  .ant-card-head-wrapper {
    height: 40px;
  }
  
  .ant-card-extra {
    top: -10px;
    position: relative;
  }
`;

interface IProps extends FormComponentProps {
  entity: ILocation | null;
  closeModal: () => void;
  isAdd?: boolean;
  type?: EnumType;
  updateEnum?: (id: number, enumType: EnumType, enumTarget: EnumTarget, data: object, cb?: () => void) => void;
  getMenuData?: (enumTarget: EnumTarget) => void;
}

interface IState {
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
      editorState: null,
    };
  }

  public componentDidMount() {
    const {entity, isAdd} = this.props;
    if (!isAdd) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(get(entity, 'description', ''))),
      });
    }
  }

  public componentDidUpdate(prevState: IProps) {
    const {entity, isAdd} = this.props;
    if (!isAdd && get(entity, 'description', '') !== get(prevState.entity, 'description', '')) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(get(entity, 'description', ''))),
      });
    }
  }

  public render(): JSX.Element {
    const {entity, form, isAdd} = this.props;
    const {getFieldDecorator} = form;
    const latLong: any = form.getFieldsValue(['latitude', 'longitude']);
    const latitude = !!latLong.latitude ? latLong.latitude : COORDS_MOSCOW[0];
    const longitude = !!latLong.longitude ? latLong.longitude : COORDS_MOSCOW[1];
    const coords: number[] = [latitude, longitude];

    return (
      <WrapperCard
        title={ !isAdd ? get(entity, 'name', '') : 'Добавление локации' }
        isAdd={ isAdd }
      >
        <AntColUpperWrapper>
          <Form>
            <GeneralCardWrapper>
              <FormBlockCard
                title={ 'Основное' }
                extra={ (
                  <React.Fragment>
                    <VisibleFormLabel>Видимость </VisibleFormLabel>
                    <Form.Item style={ {zIndex: 9999} }>
                      { getFieldDecorator('visible', {
                        rules: [{required: false}],
                        initialValue: Boolean(get(entity, 'visible', 1)),
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
                    <Uploader files={ [] } />
                  </Col>

                  <Col span={ 17 } offset={ 1 }>
                    <Form.Item label={ 'Название' }>
                      { getFieldDecorator('name', {
                        rules: [{ required: true, message: 'Введите значение' }],
                        initialValue: !isAdd ? get(entity, 'name', '') : '',
                      })(
                        <Input placeholder={ 'Название' } />,
                      ) }
                    </Form.Item>

                    <Form.Item label={ 'Категории' }>
                      { getFieldDecorator('category', {
                        rules: [{ required: false, message: 'Введите значение' }],
                        initialValue: 'Нет категории',
                      })(
                        <AutoComplete placeholder={ 'Категории' } disabled />,
                      ) }
                    </Form.Item>
                  </Col>
                </Row>
              </FormBlockCard>
            </GeneralCardWrapper>

            <br />

            <FormBlockCard title={ 'Адрес' }>
              <Row>
                <Col span={ 11 }>
                  <TextAreaWrapper>
                    <Form.Item label={ 'Адрес' } style={ {minHeight: 117} }>
                      { getFieldDecorator('address', {
                        rules: [{ required: true, message: 'Введите значение' }],
                        initialValue: !isAdd ? get(entity, 'address', '') : '',
                      })(
                        <Input placeholder={ 'Адрес' } textArea />,
                      ) }
                    </Form.Item>
                  </TextAreaWrapper>

                  <Row>
                    <Col span={ 12 }>
                      <Form.Item label={ 'Широта' }>
                        { getFieldDecorator('latitude', {
                          rules: [{ required: false }],
                          initialValue: !isAdd ? get(entity, 'latitude', '') : '',
                        })(
                          <Input placeholder={ 'Широта' } />,
                        ) }
                      </Form.Item>
                    </Col>

                    <Col span={ 12 }>
                      <Form.Item label={ 'Долгота' }>
                        { getFieldDecorator('longitude', {
                          rules: [{ required: false }],
                          initialValue: !isAdd ? get(entity, 'longitude', '') : '',
                        })(
                          <Input placeholder={ 'Долгота' } />,
                        ) }
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>

                <Col span={ 12 } offset={ 1 }>
                  <YMaps>
                    <Map
                      defaultState={ { center: coords, zoom: 16, controls: ['zoomControl'] } }
                      state={ { center: coords, zoom: 16, controls: ['zoomControl'] } }
                      width={ '100%' }
                      onClick={ this.onMapClick }
                    >
                      <Placemark
                        geometry={ {type: 'Point', coordinates: coords} }
                      />
                    </Map>
                  </YMaps>
                </Col>
              </Row>
            </FormBlockCard>

            <br />

            <FormBlockCard title={ 'Описание' }>
              <Editor
                toolbarClassName={ 'toolbarClassName' }
                wrapperClassName={ 'wrapperClassName' }
                editorClassName={ 'editorClassName' }
                localization={ {locale: 'ru'} }
                editorState={ this.state.editorState }
                onEditorStateChange={ this.onChangeText }
              />
            </FormBlockCard>

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
              style={ {position: 'relative', left: isAdd ? 630 : 542} }
            >
              { isAdd ? 'Добавить' : 'Сохранить' }
            </Button>
          </Form>
        </AntColUpperWrapper>
      </WrapperCard>
    );
  }

  private onChangeText = (editorState: EditorState) => this.setState({editorState});

  private onMapClick =event => {
    const coords: number[] = event.get('coords');
    this.props.form.setFieldsValue({latitude: coords[0], longitude: coords[1]});
  };

  private onSubmit = () => {
    const {entity, type, closeModal, form, updateEnum, getMenuData} = this.props;
    const {editorState} = this.state;

    form.validateFields((errors, values) => {
      if (!errors) {
        updateEnum(
          get(entity, 'id', null),
          type,
          'locations',
          {
            ...values,
            description: editorState ? editorState.getCurrentContent().getPlainText() : '',
            visible: +values.visible,
          },
          () => {
            closeModal();
            getMenuData('locations');
          },
        );
        form.resetFields();
      }
    });
  };

  private delete = (id: number) => () => this.props.updateEnum(id, 'DELETE', 'locations', {}, () => {
    const {closeModal, getMenuData} = this.props;

    closeModal();
    getMenuData('locations');
  });
}

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    updateEnum(id: number, enumType: EnumType, enumTarget: EnumTarget, data: object, cb?: () => void) {
      dispatch(PeopleAPI.updateEnum(id, enumType, enumTarget, data, cb));
    },
    getMenuData: (enumTarget: EnumTarget) => dispatch(MenuEditListApi.getMenuData(enumTarget)),
  };
};

export default connect(null, mapDispatchToProps)(Form.create()(EditForm));
