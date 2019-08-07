import * as React from 'react';

interface IProps {
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default class FakeImg extends React.Component<IProps> {
  public render(): JSX.Element {
    const {style, onClick} = this.props;
    return (
      <div
        style={ {
          background: 'grey',
          border: '1px solid grey',
          borderRadius: 40,
          width: 40,
          height: 40,
          cursor: 'pointer',
          position: 'relative',
          left: 6,
          ...style,
        } }
        onClick={ onClick }
      />
    );
  }
}
