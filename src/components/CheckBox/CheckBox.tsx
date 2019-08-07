import * as React from 'react';
import { Checkbox as AntdCheckbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

interface IProps {
  text?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
  customOnChange?: (value: boolean) => void;
}

interface IState {
  value: boolean;
}

export default class CheckBox extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
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
    const {text} = this.props;
    const {value} = this.state;

    return (
      <AntdCheckbox checked={ value } onChange={ this.handleChange }>
        { text }
      </AntdCheckbox>
    );
  }

  public handleChange(event: CheckboxChangeEvent) {
    const value: boolean = event.target.checked;
  
    this.setState({value});
    this.triggerChange(value);
  }

  public triggerChange(changedValue: boolean) {
    const {onChange, customOnChange} = this.props;

    if (onChange) {
      onChange(changedValue);
    }

    if (customOnChange) {
      customOnChange(changedValue);
    }
  }
}
