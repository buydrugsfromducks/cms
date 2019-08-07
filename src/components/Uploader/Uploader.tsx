import * as React from 'react';
import { Upload, Button, Spin, Icon } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import styled from 'styled-components';

import './Uploader.scss';

import b from '../../service/Utils/b';

const UploaderWrapper = styled.div`
  .ant-upload.ant-upload-drag {
    border: 1px solid #d9d9d9;
    width: 180px;
    height: 180px;
  }

  .ant-upload-drag-container > i{
    opacity: 0;
  }

  .ant-upload-drag-container:hover > i{
    opacity: 1;
  }
`;

const Dashed = styled.div`
    width: 180px;
    height: 180px;
    border: 1px dashed #e9e9e9;
    position: absolute;
    top: 0;
    margin-left: auto;
    margin-right: auto;
    left: 50%;
    transform: translateX(-50%) scale(0.9, 0.9);
`;

const TextWrapper = styled.div`
  position: relative;
  top: 10px;
`;

interface IProps {
  files: UploadFile[];
  imageUrl?: string;
  beforeUploadFile?: (file: UploadFile) => boolean;
  onRemove?: () => void;
}

export default class Uploader extends React.Component<IProps> {
  public render(): React.ReactNode {
    const { beforeUploadFile, onRemove, files, imageUrl } = this.props;

    return (
      <UploaderWrapper>
        <Upload.Dragger
          beforeUpload={ beforeUploadFile }
          onRemove={ onRemove }
          listType={ 'picture-card' }
          fileList={ null }
        >
          { files.length === 1
            ? imageUrl ? this.getImgPreview() : <Spin />
            : this.getUploadButton() }
        </Upload.Dragger>
      </UploaderWrapper>
    );
  }

  private getImgPreview = (): React.ReactNode => {
    const { imageUrl } = this.props;

    return (
      <React.Fragment>
        <Icon type={ 'delete' } className={ 'uploader__img-close' } onClick={ this.onRemovePhoto } />
        <img alt={ 'preview' } className={ b('uploader', 'img') } src={ imageUrl } />
      </React.Fragment>
    );
  };

  private onRemovePhoto =event => {
    event.preventDefault();

    const {onRemove} = this.props;
    if (onRemove) {
      onRemove();
    }
  };

  private getUploadButton = (): React.ReactNode => (
    <React.Fragment>
      <TextWrapper>
        <span>Перетащите изображение</span>
        <br />
        <span>или</span>
        <br />
        <Button icon={ 'picture' }>Нажмите</Button>
      </TextWrapper>
      <Dashed />
    </React.Fragment>
  );
}
