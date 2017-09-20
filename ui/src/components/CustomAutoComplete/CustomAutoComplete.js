import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { map } from 'lodash';
import { TextInputGroup, AutoComplete, OptionListItem } from 'ui/components';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const ADD_MODE = 'ADD_MODE';
const EDIT_MODE = 'EDIT_MODE';
const SEARCH_MODE = 'SEARCH_MODE';

// Wraps the AutoComplete component with input functionality
// allowing users to add their own options

class CustomAutoComplete extends Component {
  static propTypes = {
    multi: PropTypes.bool,
    noBorder: PropTypes.bool,
    options: PropTypes.instanceOf(Map),
    isLoading: PropTypes.bool,
    optionCount: PropTypes.number,
    fetchMore: PropTypes.func,
    // can be either single value or multiple depending on the multi prop
    values: PropTypes.instanceOf(Map),
    editableFields: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    onChangeFilter: PropTypes.func,
    onUpdateValue: PropTypes.func,
    onAddValue: PropTypes.func,
    onDeleteValue: PropTypes.func,
    optionEditor: PropTypes.func
  }

  static defaultProps = {
    editableFields: ['value'],
    defaultAttributes: {},
    onChange: () => null,
    onChangeFilter: () => null,
    options: new Map(),
  }

  constructor(props) {
    super(props);
    this.state = {
      isAdding: false,
      isEditing: false,
      isSearching: false,
      inputValue: '',
      focused: false
    };
  }

  selectOption = (value) => {
    this.props.onChange(value);
    this.toggleSearchingOff();
  }

  toggleAddingOn = () => {
    this.setState({
      isAdding: true,
      isSearching: false,
      isEditing: false
    });
  };

  toggleSearchingOn = (e) => {
    // click goes down to AutoComplete and closes it otherwise
    if (e) e.stopPropagation();
    this.setState({
      isSearching: true,
      isAdding: false,
      isEditing: false,
      focused: true
    });
  };

  clearInput = () => {
    this.setState({
      inputValue: ''
    });
  }

  onClickClear = () => {
    this.clearInput();
    this.toggleSearchingOn();
  }

  toggleEditingValue = (value) => {
    this.setState({
      isEditingActive: true
    });
    this.toggleEditingOn(value);
  }

  toggleEditingOn = (value) => {
    this.setState({
      isSearching: false,
      isAdding: false,
      isEditing: true,
      editingValue: value,
      inputValue: ''
    });
  };

  toggleAddingOff = () => this.setState({ isAdding: false });
  toggleEditingOff = () => this.setState({
    isEditing: false,
    isEditingActive: false,
    editingValue: null
  });
  toggleSearchingOff = () => {
    this.setState({ isSearching: false, inputValue: '' });
    this.props.onChangeFilter('');
  };

  onChangeFilter = (inputValue) => {
    this.setState({ inputValue });
    this.props.onChangeFilter(inputValue);
  }

  onUpdateValue = (newAttributes) => {
    const { editingValue, isEditingActive } = this.state;
    this.props.onChangeFilter('');
    this.props.onUpdateValue({
      value: editingValue,
      newAttributes,
      isEditingActive
    });
    this.toggleEditingOff();
  }

  onAddValue = (newAttributes) => {
    const { values } = this.props;
    this.setState({
      isAdding: false,
      isEditing: false,
      inputValue: ''
    });
    this.props.onChangeFilter('');
    this.props.onAddValue({ values, newAttributes });
  }

  moveCursorToEnd = (e) => {
    const value = e.target.value;
    e.target.value = '';
    e.target.value = value;
  }

  getCurrentMode = () => {
    const { isAdding, isEditing, isSearching } = this.state;
    if (isAdding) return ADD_MODE;
    if (isEditing) return EDIT_MODE;
    if (isSearching) return SEARCH_MODE;
    return null; // default mode, displays selected option
  }

  onDeleteSelected = () => {
    this.onDelete(this.props.value);
  }
  onDelete = (value) => {
    this.props.onDeleteValue(value);
  }

  getDefaultValues = (fields, input, value) => map(fields, (field, i) => {
    if (i === 0 && input) return input;
    return value.get(field);
  })

  renderOption = (option) => {
    const { parseOption, parseOptionTooltip, editableFields } = this.props;
    const label =
      parseOption && parseOption(option)
      || option.get(editableFields[0]);
    const tooltip =
      parseOptionTooltip
      && parseOptionTooltip(option) || option.get(editableFields[0]);

    return (
      <OptionListItem
        onEdit={this.toggleEditingOn}
        onDelete={this.onDelete}
        data={option}
        label={label}
        tooltip={tooltip} />
    );
  }

  renderSingleValue = (unused, value) => {
    const { parseOption, parseOptionTooltip } = this.props;
    return (
      <OptionListItem
        onEdit={this.toggleEditingValue}
        onDelete={this.onDelete}
        data={value}
        label={parseOption(value)}
        tooltip={parseOptionTooltip(value)} />
    );
  }

  renderInput = () => {
    const {
      editableFields,
      fetchMore,
      isLoading,
      multi,
      optionCount,
      optionEditor,
      parseOption,
      parseOptionTooltip,
      options,
      values,
      noBorder,
    } = this.props;
    const optionEditorComponent = optionEditor || TextInputGroup;
    const { inputValue, editingValue } = this.state;
    const currentMode = this.getCurrentMode();

    switch (currentMode) {
      case ADD_MODE: return (
        React.createElement(optionEditorComponent, {
          fields: editableFields,
          defaultValues: this.getDefaultValues(editableFields, inputValue, values),
          onSubmit: this.onAddValue,
          onCancel: this.toggleAddingOff
        })
      );
      case EDIT_MODE: return (
        React.createElement(optionEditorComponent, {
          onFocus: this.moveCursorToEnd,
          fields: editableFields,
          defaultValues: this.getDefaultValues(editableFields, null, editingValue),
          onSubmit: this.onUpdateValue,
          onCancel: this.toggleEditingOff
        })
      );
      case SEARCH_MODE:
      default: return (
        <AutoComplete
          focused={this.state.focused}
          onBlur={this.toggleSearchingOff}
          onChangeFilter={this.onChangeFilter}
          onChange={this.selectOption}
          renderOption={this.renderOption}
          parseOption={parseOption}
          parseOptionTooltip={parseOptionTooltip}
          multi={multi}
          noBorder={noBorder}
          values={values}
          options={options}
          optionCount={optionCount}
          isLoading={isLoading}
          renderSingleValue={this.renderSingleValue}
          fetchMore={fetchMore} >
          <OptionListItem label="Add new" onClick={this.toggleAddingOn} />
        </AutoComplete>
      );
    }
  }

  render = () => (
    <div className={styles.inputWrapper} >
      { this.renderInput() }
    </div>
  );
}

export default withStyles(styles)(CustomAutoComplete);
