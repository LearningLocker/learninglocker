import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { noop, identity, debounce, isNull } from 'lodash';
import OptionList from 'ui/components/OptionList';
import OptionListItem from 'ui/components/OptionListItem';
import areEqualProps from 'ui/utils/hocs/areEqualProps';
import keyCodes from 'lib/constants/keyCodes';
import Token from './token/Token';
import Input from './Input';
import InputWrapper from './InputWrapper';
import Spinner from './Spinner';

class AutoComplete extends Component {

  static propTypes = {
    // initial state
    // can be either single value or multiple depending on the multi prop
    values: PropTypes.instanceOf(Map),
    placeholder: PropTypes.string,
    focused: PropTypes.bool,
    noBorder: PropTypes.bool,

    // behaviour
    multi: PropTypes.bool, // do we allow multiple values to be selected at once
    parseOption: PropTypes.func,
    parseOptionTooltip: PropTypes.func,
    onBlur: PropTypes.func,

    // data
    optionCount: PropTypes.number,
    options: PropTypes.instanceOf(Map),
    isLoading: PropTypes.bool,
    fetchMore: PropTypes.func,

    // handles
    onChangeFilter: PropTypes.func,
    onChange: PropTypes.func,

    children: PropTypes.node
  }

  static defaultProps = {
    // initial state
    options: new List(),
    isLoading: false,
    fetchMore: () => { },

    values: new Map(),
    placeholder: 'Type to limit suggestions',
    focused: false,

    // behaviour
    limitToOptions: false,
    multi: false,
    parseOption: identity,
    parseOptionTooltip: identity,
    onBlur: noop,

    // handles
    onChangeFilter: noop,
    onChange: noop
  }

  // LIFECYCLE
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      inputValue: null,
    };
    this.propagateInputChange =
      debounce(this.propagateInputChange, 400, { leading: true, trailing: true });
  }

  componentDidMount() {
    if (window) {
      window.addEventListener('click', this.handleClick);
    }
    if (this.props.focused) {
      this.focus();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const p = areEqualProps(this.props, nextProps);
    const s = areEqualProps(this.state, nextState);
    return !p || !s;
  }

  componentWillUnmount() {
    if (window) {
      window.removeEventListener('click', this.handleClick);
      this.unbindListeners();
    }
  }

  // EVENT HANDLERS
  onChangeFilter = (e) => {
    const value = e.target.value;
    this.propagateInputChange(value);
    this.setState({
      inputValue: value
    });
  }

  propagateInputChange = (value) => {
    this.props.onChangeFilter(value);
  }

  onKeyDown = (e) => {
    switch (e.keyCode) {
      case keyCodes.ESC:
        this.blur();
        break;
      case keyCodes.BACKSPACE:
        if (
          (this.state.inputValue === null || this.state.inputValue.length === 0)
          && this.props.values.size > 0
          && this.props.multi) {
          e.preventDefault();
          this.deleteValue(
            this.props.values.lastKeyOf(this.props.values.last())
          );
        }
        break;
      default: break;
    }
  }

  getAvailableOptions = () => {
    const { values, options } = this.props;
    return options.withMutations((optsWithMuts) => {
      values.forEach((_, key) => {
        optsWithMuts.delete(key);
      });
    }).entrySeq().toList();
  }

  focus = () => {
    if (this.input) {
      this.input.focus();
    }
    this.bindListeners();
    this.setState({ focused: true });
  }

  blur = () => {
    if (this.input) {
      this.input.blur();
    }

    this.unbindListeners();
    this.setState({
      focused: false,
      inputValue: null
    });
    this.props.onBlur();
  }

  deleteValue = (key) => {
    const newValues = this.props.values.delete(key);
    this.props.onChange(newValues);
    this.setState({
      inputValue: null
    });
    this.focus();
  }

  addValue = (option) => {
    const { multi } = this.props;
    const index = option[0];
    const value = option[1];

    const newValues = multi ?
      this.props.values.set(index, value) :
      new Map({ [index]: value });

    this.props.onChange(newValues);

    this.setState({
      inputValue: null
    });

    if (this.props.multi) this.focus();
    else this.blur();
  }

  handleClick = (e) => {
    const clickedInside = this.wrapper.contains(e.target);
    if (!clickedInside && this.state.focused) {
      this.blur();
    }

    if (clickedInside && !this.state.focused) {
      this.focus();
    }
  }

  bindListeners() {
    if (!this.keyDownListener) {
      this.keyDownListener = window.addEventListener('keydown', this.onKeyDown);
    }
  }

  unbindListeners() {
    window.removeEventListener('keydown', this.onKeyDown);
    delete this.keyDownListener;
  }

  // if in single value mode, get the user's input or the current value as a string
  // if in multi mode return the inputValue
  getInputValue = () => {
    const { values, multi, parseOption } = this.props;
    const { inputValue } = this.state;
    if (multi) return inputValue;
    const firstValue = values.first() || new Map();
    if (isNull(inputValue)) return parseOption(firstValue);
    return inputValue;
  }

  renderOption = (value) => {
    const { parseOption, parseOptionTooltip, renderOption } = this.props;
    const key = value[0];
    const option = value[1];
    if (renderOption) return renderOption(option, key);
    const label = parseOption(option);
    const tooltip = parseOptionTooltip(option);

    return (
      <OptionListItem
        label={label}
        tooltip={tooltip} />
    );
  }

  renderOptionsDropdown = () => {
    if (this.state.focused) {
      return (
        <OptionList
          options={this.getAvailableOptions()}
          handleAddSelected={this.addValue}
          renderOption={this.renderOption}
          isLoading={this.props.isLoading}
          fetchMore={this.props.fetchMore}
          rowCount={this.props.optionCount - this.props.values.size}>
          {this.props.children}
        </OptionList>
      );
    }
    return null;
  }

  renderStatus = () => (this.props.isLoading ? <Spinner /> : null);

  renderSingleValue = (value) => {
    const { renderSingleValue } = this.props;

    if (renderSingleValue) {
      return (
        <div style={{ position: 'absolute', width: '100%' }}>
          {renderSingleValue(value)}
        </div>
      );
    }
  }

  renderInput = () => {
    const { multi, values } = this.props;
    const hasSingleValue = !multi && values.first();
    const placeholder = hasSingleValue ? '' : this.props.placeholder;
    const inputValue = this.getInputValue();
    return (
      <Input
        onFocus={this.focus}
        onChange={this.onChangeFilter}
        value={inputValue}
        placeholder={placeholder}
        ref={(ref) => { this.input = ref; }} />
    );
  }

  renderValues = () => {
    const { inputValue } = this.state;
    const { values, multi, parseOption, parseOptionTooltip } = this.props;
    const hasSingleValue = !multi && values.first();

    if (multi) {
      return values.map((value, key) =>
        <Token
          key={key}
          index={key}
          value={value}
          parse={parseOption}
          parseTooltip={parseOptionTooltip}
          handleRemove={this.deleteValue.bind(this, key)} />
      ).valueSeq();
    }
    return hasSingleValue && inputValue === '' &&
      this.renderSingleValue(values.first());
  }

  render() {
    const { focused, noBorder } = this.props;

    return (
      <div
        ref={(ref) => { this.wrapper = ref; }}
        style={{ position: 'relative', height: '100%' }}>
        <InputWrapper
          isOpen={focused}
          isBorderHidden={!focused && noBorder}
          onClick={this.focus} >
          {this.renderValues()}
          {this.renderInput()}
          {this.renderStatus()}
        </InputWrapper>
        {this.renderOptionsDropdown()}
      </div>
    );
  }
}

export default AutoComplete;
