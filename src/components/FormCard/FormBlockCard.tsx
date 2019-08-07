import * as React from 'react';
import { Card } from 'antd';
import styled from 'styled-components';

const CardWrapper = styled.div`
  .ant-card-extra {
    position: relative;
    top: -10px;
  }
  
  .ant-row .ant-form-item {
    height: 64px;
  }
`;

interface IProps {
  title?: string;
  extra?: JSX.Element;
  bodyStyle?: React.CSSProperties;
}

export default class FormBlockCard extends React.Component<IProps> {
  public render(): JSX.Element {
    const {title, extra, children, bodyStyle} = this.props;

    return (
      <CardWrapper>
        <Card
          title={ title }
          headStyle={ {height: 40} }
          bodyStyle={ bodyStyle }
          extra={ extra }
        >
          { children }
        </Card>
      </CardWrapper>
    );
  }
}
