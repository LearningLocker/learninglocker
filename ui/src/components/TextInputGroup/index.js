import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import TextInput from 'ui/components/TextInput';
import { IconButton } from 'react-toolbox/lib/button';
import onClickOutside from 'react-onclickoutside';
import styles from './styles.css';

// Uncontrolled input component to edit a string
class TextInputGroup extends Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    fields: PropTypes.arrayOf(PropTypes.string),
    defaultValues: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string
  }

  static defaultProps = {
    onSubmit: () => {},
    onCancel: () => {},
    onFocus: () => {},
    placeholder: '',
    defaultValues: []
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
    const { className, fields, defaultValues } = this.props;
    return (
      <form
        onSubmit={this.onSubmit}
        className={`${styles.form} ${className} clearfix`}>
        {fields.map((field, key) =>
          <TextInput
            key={key}
            autoFocus={key === 0}
            defaultValue={defaultValues[key]}
            label={field}
            onChange={this.onChangeField} />
        )}
        <div className={`${styles.buttons} clearfix`}>
          <IconButton
            onClick={this.onSubmit} >
            <i className="ion-checkmark" />
          </IconButton>
          <IconButton
            onClick={this.onCancel} >
            <i className="ion-close-round" />
          </IconButton>
        </div>
      </form>
    );
  }
}

export default compose(
  withStyles(styles),
  onClickOutside
)(TextInputGroup);
