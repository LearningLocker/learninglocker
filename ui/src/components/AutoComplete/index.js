import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Map, List } from 'immutable';
import { noop, identity, debounce, isNull } from 'lodash';
import OptionList from 'ui/components/OptionList';
import OptionListItem from 'ui/components/OptionListItem';
import keyCodes from 'lib/constants/keyCodes';
import Token from './token/Token';
import styles from './autocomplete.css';

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
    fetchMore: () => {},

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
      ...this.stateFromProps(this.props),
      inputValue: null
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

  componentWillReceiveProps(nextProps) { this.setState(this.stateFromProps(nextProps)); }

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
          && this.state.values.size > 0
          && this.props.multi) {
          e.preventDefault();
          this.deleteValue(
            this.state.values.lastKeyOf(this.state.values.last())
          );
        }
        break;
      default: break;
    }
  }

  getAvailableOptions = () => {
    const { options } = this.state;
    return options;
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
    const newValues = this.state.values.delete(key);
    // the new values will be picked up from props after going through global state
    // upodate them in local state immediately for a faster feel
    this.setState({
      values: newValues,
      inputValue: null
    });
    this.props.onChange(newValues);
    this.focus();
  }

  addValue = (option) => {
    const { multi } = this.props;
    const index = option[0];
    const value = option[1];
    let newValues;

    // the new values will be picked up from props after going through global state
    // add them to local state immediately for a faster feel
    if (multi) {
      newValues = this.state.values.set(index, value);
    } else {
      newValues = new Map({ [index]: value });
    }

    this.props.onChange(newValues);

    this.setState({
      values: newValues,
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

  stateFromProps = (props) => {
    const { values, options } = props;

    const newOptions = options.withMutations((optsWithMuts) => {
      values.forEach((value, key) => {
        optsWithMuts.delete(key);
      });
    }).entrySeq().toList();
    return {
      values,
      options: newOptions
    };
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
          rowCount={this.props.optionCount - this.state.values.size}>
          {this.props.children}
        </OptionList>
      );
    }
    return null;
  }

  renderStatus = () => (this.props.isLoading ? <div className={styles.isLoading} /> : null);

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
    const { multi } = this.props;
    const { values } = this.state;
    const hasSingleValue = !multi && values.first();
    const placeholder = hasSingleValue ? '' : this.props.placeholder;
    const inputValue = this.getInputValue();
    return (
      <input
        className={styles.input}
        onFocus={this.focus}
        onChange={this.onChangeFilter}
        value={inputValue}
        placeholder={placeholder}
        ref={(ref) => { this.input = ref; }} />
    );
  }

  renderValues = () => {
    const { values, inputValue } = this.state;
    const { multi, parseOption, parseOptionTooltip } = this.props;
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
    const wrapperClasses = classNames({
      [styles.inputWrapper]: true,
      [styles.open]: this.state.focused,
      [styles.noBorder]: !this.state.focused && this.props.noBorder
    });

    return (
      <div ref={(ref) => { this.wrapper = ref; }} className={styles.wrapper}>
        <div onClick={this.focus} className={wrapperClasses}>
          {this.renderValues()}
          {this.renderInput()}
          {this.renderStatus()}
        </div>
        {this.renderOptionsDropdown()}
      </div>
    );
  }
}

export default withStyles(styles)(AutoComplete);
