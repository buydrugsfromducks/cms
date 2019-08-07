import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Card, Form, Button, Upload, Icon } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { EnumTarget, EnumType, UploadType } from 'react-cms';
import { UploadFile } from 'antd/lib/upload/interface';

import { IReducers } from '../../../redux';
import { FilesAPI } from '../api/files';

//import { PeopleAPI } from '../../People/api/people';
import { MenuEditListApi } from '../../../components/MenuEditList/api/menuEditList';

interface IProps extends FormComponentProps {
  closeModal?: () => void;
  type?: EnumType;
  updateEnum?: (id: number, enumType: EnumType, enumTarget: EnumTarget, data: object, cb?: () => void) => void;
  uploadImage?: (data: UploadFile[], uploadType: UploadType, cb?: (url: string[]) => void) => void;
  getMenuData?: (enumTarget: EnumTarget) => void;
}

interface IState {
  imageUrl: string[];
  file: UploadFile[];
}

class EditForm extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    type: 'PUT',
  };

  constructor(props: IProps) {
    super(props);

    this.state = {
      imageUrl: null,
      file: [],
    };
  }

  public render(): JSX.Element {
    return (
      <Card>
        <Form>
          <Upload.Dragger
            beforeUpload={ this.beforeUploadFile }
            onRemove={ this.removeFile }
            fileList={ this.state.file.filter(item => !!item) }
            multiple
          >
            <p className='ant-upload-drag-icon'>
              <Icon type='inbox' />
            </p>

            <p className='ant-upload-text'>Нажмите или перетащите файл в эту область</p>
          </Upload.Dragger>

          <br />
          <Button style={ { display: 'block', margin: '0 auto' } } type={ 'primary' } onClick={ this.onSubmit }>
              Добавить
          </Button>

        </Form>
      </Card>
    );
  }

  private onSubmit = () => {
    const { type, closeModal, form, updateEnum, getMenuData, uploadImage } = this.props;
    const { file } = this.state;

    form.validateFields(errors => {
      if (!errors) {
        console.log(file[0].size);
        console.log(file[0].type);
        uploadImage(
          file,
          'ico',
          (urls: string[]) => urls.forEach((url: string, index: number) => updateEnum(
            null,
            type,
            'icons',
            { url },
            index === urls.length - 1
              ? () => {
                closeModal();
                getMenuData('icons');
              }
              : undefined,
          )),
        );

        this.setState({ file: [], imageUrl: [] });
      }
    });
  };

  private removeFile = (file: UploadFile) => this.setState((state: IState) => {
    const index = state.file.indexOf(file);
    const newFileList = state.file.slice();
    newFileList.splice(index, 1);
    return { file: newFileList };
  });

  private beforeUploadFile = (file: UploadFile) => {
    this.setState({ file: [...this.state.file, file] });
    return false;
  };
}

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    updateEnum(id: any) {
      dispatch(FilesAPI.updateFile(id));
    },
    uploadImage: (data: UploadFile[], uploadType: UploadType, cb?: (url: string[]) => void) => dispatch(FilesAPI.uploadImage(data, uploadType, cb)),
    //getMenuData: (enumTarget: EnumTarget) => dispatch(MenuEditListApi.getMenuData(enumTarget)),
  };
};

export default connect(null, mapDispatchToProps)(Form.create()(EditForm));
