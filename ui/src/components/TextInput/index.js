import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

// Uncontrolled input component to edit a string
class TextInput extends Component {
  static propTypes = {
    onCancel: PropTypes.func,
    label: PropTypes.string,
    autoFocus: PropTypes.bool,
    defaultValue: PropTypes.string,
  }

  static defaultProps = {
    onCancel: () => {},
    placeholder: ''
  }

  constructor(props) {
    super(props);
    this.state = { value: props.defaultValue };
  }

  state = {
    value: ''
  }

  onChange = (e) => {
    this.props.onChange(e.target.value, this.props.label);
    this.setState({ value: e.target.value });
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state.value);
  }

  onCancel = (e) => {
    e.preventDefault();
    this.setState({ value: '' });
    this.props.onCancel();
  }

  render = () => {
    const { label, onFocus, autoFocus } = this.props;
    const { value } = this.state;

    return (
      <div className={`form-group ${styles.group}`}>
        <label htmlFor={label} className={styles.label}>
          {label}
        </label>
        <div className={`form-control ${styles.input}`}>
          <input
            autoFocus={autoFocus}
            type="text"
            label={label}
            onChange={this.onChange}
            defaultValue={value}
            name={label}
            onFocus={onFocus} />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(TextInput);
