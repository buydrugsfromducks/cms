import * as React from 'react';
import { Card } from 'antd';
import styled from 'styled-components';

const CardHeaderWrapper = styled.div`
  .ant-card-head-title {
    top: -8px !important;
  }
`;

interface IProps {
  style?: React.CSSProperties;
  title?: string | JSX.Element;
  isAdd?: boolean;
}

export default class WrapperCard extends React.Component<IProps> {
  public static defaultProps: Partial<IProps> = {
    isAdd: false,
    style: null,
  };

  public render(): JSX.Element {
    const {isAdd, style, title, children} = this.props;

    return (
      <CardHeaderWrapper
      
      >
        <Card
          style={ style }
          title={ title }
        >
          { children }
        </Card>
      </CardHeaderWrapper>
    );
  }
}
