import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { IconButton } from 'react-toolbox/lib/button';
import onClickOutside from 'react-onclickoutside';
import styled from 'styled-components';
import TextInput from 'ui/components/TextInput';

const Form = styled.form`
  padding-left: 8px;
  border-radius: 2px;
  flex-grow: 1;
  background-color: white;
  position: relative;
  z-index: 9999;
  display: flex;
  right: 0;
`;

// Uncontrolled input component to edit a string
class TextInputGroup extends Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    fields: PropTypes.arrayOf(PropTypes.string),
    defaultValues: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    submitIcon: PropTypes.string,
    cancelIcon: PropTypes.string
  }

  static defaultProps = {
    onSubmit: () => {},
    onCancel: () => {},
    onFocus: () => {},
    placeholder: '',
    defaultValues: [],
    submitIcon: 'ion-checkmark',
    cancelIcon: 'ion-close-round'
  }

  handleClickOutside = () => {
    this.props.onCancel();
  }

  onSubmit = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onSubmit(this.state);
  }

  onCancel = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.setState({ value: '' });
    this.props.onCancel();
  }

  onChangeField = (value, field) => {
    this.setState({ [field]: value });
  }

  render = () => {
    const { className, fields, defaultValues, submitIcon, cancelIcon } = this.props;
    return (
      <Form
        onSubmit={this.onSubmit}
        className={`${className} clearfix`}>
        {fields.map((field, key) =>
          <TextInput
            key={key}
            autoFocus={key === 0}
            defaultValue={defaultValues[key]}
            name={field}
            onChange={this.onChangeField} />
        )}
        <div
          className={'clearfix'}
          style={{ float: 'right' }}>
          <IconButton
            onClick={this.onSubmit} >
            <i className={submitIcon} />
          </IconButton>

          {(typeof cancelIcon === 'string') &&
            <IconButton
              onClick={this.onCancel} >
              <i className={cancelIcon} />
            </IconButton>
          }

        </div>
      </Form>
    );
  }
}

export default compose(
  onClickOutside
)(TextInputGroup);
