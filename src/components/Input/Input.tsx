import * as React from 'react';
import { Input as AntdInput } from 'antd';
import { ChangeEvent } from 'react';

interface IProps {
  name?: string | null;
  type?: string;
  placeholder?: string;
  textArea?: boolean;
  minAreaHeight?: string | number;
  filter?: (value, option) => boolean;
  style?: React.CSSProperties;
  value?: string;
  disabled?: boolean;
  clearButton?: boolean;
  onChange?: (event) => void;
  onKeyPress?: any;
  onBlur?: (event) => void;
  customOnChange?: (value: string) => void;
  updateText?: (previous: string, current: string) => string;
}

interface IState {
  value: string;
}

export default class Input extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    textArea: false,
    minAreaHeight: 100,
  };

  constructor(props: IProps) {
    super(props);

    this.state = {value: this.props.value};

    this.handleChange = this.handleChange.bind(this);
  }

  public componentWillReceiveProps(nextProps: any) {
    if (nextProps.hasOwnProperty('value')) {
      this.setState({value: nextProps.value});
    }
  }

  public render(): JSX.Element {
    const { onKeyPress ,type, placeholder, style, onBlur, textArea, minAreaHeight} = this.props;
    const {value} = this.state;

    return (
      !textArea
        ? (
          <AntdInput
            type={ type }
            value={ value }
            onPressEnter={ onKeyPress }
            placeholder={ placeholder }
            onChange={ this.handleChange }
            style={ style }
            onBlur={ onBlur }
          />
        )
        : (
          <AntdInput.TextArea
            value={ value }
            placeholder={ placeholder }
            onChange={ this.handleChange }
            style={ {...style, minHeight: minAreaHeight} }
            onBlur={ onBlur }
          />
        )
    );
  }

  public handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const {updateText} = this.props;
    let value: string = event.target.value;
    
    if (updateText) {
      value = updateText(this.state.value, value);
    }
  
    this.setState({value});
    this.triggerChange(value);
  }

  public triggerChange(changedValue: string) {
    const {onChange, customOnChange} = this.props;

    if (onChange) {
      onChange(changedValue);
    }

    if (customOnChange) {
      customOnChange(changedValue);
    }
  }
}
