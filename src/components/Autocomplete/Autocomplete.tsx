import * as React from 'react';
import { AutoComplete as AntdAutoComplete, Input, Icon } from 'antd';
import { DataSourceItemType } from 'antd/lib/auto-complete';
import styled from 'styled-components';

const AutoCompleteWrapper = styled.div`
  .ant-select-selection__placeholder {
    display: none !important;
  }
`;

interface IProps {
  name?: string | null;
  placeholder?: string;
  filter?: (value, option) => boolean;
  data?: DataSourceItemType[];
  style?: React.CSSProperties;
  value?: string;
  disabled?: boolean;
  prefixAddon?: string | JSX.Element;
  dropdownClassName?: string;
  clearButton?: boolean;
  onClear?: () => void;
  onChange?: (event) => void;
  customOnChange?: (value: string) => void;
  onPick?: (value: string, option) => void;
  updateText?: (previous: string, current: string) => string;
}

interface IState {
  value: string;
}

export default class AutoComplete extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    clearButton: true,
    data: [],
    disabled: false,
    style: null,
    dropdownClassName: '',
    prefixAddon: null,
    filter: (inputValue: any, option: any) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1,
  };

  constructor(props: IProps) {
    super(props);

    this.state = {value: this.props.value};

    this.handleChange = this.handleChange.bind(this);
    this.clearValue = this.clearValue.bind(this);
  }

  public componentWillReceiveProps(nextProps: any) {
    if (nextProps.hasOwnProperty('value')) {
      this.setState({value: nextProps.value});
    }
  }

  public render(): JSX.Element {
    const {placeholder, data, onPick, disabled, style, filter, prefixAddon, dropdownClassName} = this.props;
    const {value} = this.state;

    return (
      <AutoCompleteWrapper>
        <AntdAutoComplete
          value={ value }
          dataSource={ data }
          placeholder={ placeholder }
          filterOption={ filter }
          onChange={ this.handleChange }
          onSelect={ onPick }
          style={ style }
          dropdownClassName={ dropdownClassName }
          disabled={ disabled }
        >
          <Input
            className='input'
            placeholder={ placeholder }
            disabled={ disabled }
            addonBefore={ prefixAddon }
            suffix={ !disabled ? <Icon type={ 'close' } onClick={ this.clearValue } /> : null }
            autoComplete='off'
          />
        </AntdAutoComplete>
      </AutoCompleteWrapper>
    );
  }

  public handleChange(value: string) {
    const {updateText} = this.props;

    if (updateText) {
      value = updateText(this.state.value, value);
    }

    if (!(this.props.hasOwnProperty('value'))) {
      this.setState({value});
    }

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

  private clearValue = () => {
    const {onClear} = this.props;
    this.handleChange('');

    if (onClear) {
      onClear();
    }
  }
}
