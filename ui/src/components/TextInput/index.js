import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const FormGroup = styled.div`
  margin-bottom: 0;
  flex-grow: 1;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 0;
`;

const Input = styled.input`
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid #CCC;
  outline: none;
  box-shadow: none;
  flex-grow: 1;

  &:focus {
    box-shadow: none;
  }
`;

const InputWrapper = styled.div`
  padding: 0 8px 0 0;
  display: flex !important;
  align-items: center;
  border-radius: 2px;
  overflow: hidden;
  min-height: 36px;
  border: none;
  box-shadow: none;
`;

// Uncontrolled input component to edit a string
class TextInput extends Component {
  static propTypes = {
    onCancel: PropTypes.func,
    label: PropTypes.string,
    name: PropTypes.string,
    autoFocus: PropTypes.bool,
    defaultValue: PropTypes.string,
  };

  static defaultProps = {
    onCancel: () => {
    },
    placeholder: ''
  };

  constructor(props) {
    super(props);
    this.state = { value: props.defaultValue };
  }

  state = {
    value: ''
  };

  onChange = (e) => {
    this.props.onChange(e.target.value, this.props.label || this.props.name);
    this.setState({ value: e.target.value });
  };

  onSubmit = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state.value);
  };

  onCancel = (e) => {
    e.preventDefault();
    this.setState({ value: '' });
    this.props.onCancel();
  };

  renderLabel = () => {
    const { label } = this.props;

    if (!label) {
      return null;
    }

    return (
      <Label
        htmlFor={label} >
        {label}
      </Label>
    );
  };

  render = () => {
    const { label, onFocus, autoFocus, name } = this.props;
    const { value } = this.state;

    return (
      <FormGroup className={'form-group'} >
        {this.renderLabel()}
        <InputWrapper className={'form-control'}>
          <Input
            autoFocus={autoFocus}
            type="text"
            label={label}
            onChange={this.onChange}
            onClick={(event) => {
              event.preventDefault();
            }}
            defaultValue={value}
            name={label || name}
            onFocus={onFocus} />
        </InputWrapper>
      </FormGroup>
    );
  };
}

export default TextInput;
