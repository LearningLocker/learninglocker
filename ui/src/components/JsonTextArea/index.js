import React, { Component, PropTypes } from 'react';
import { Map, fromJS } from 'immutable';
import Textarea from 'react-textarea-autosize';
import classNames from 'classnames';
import { debounce } from 'lodash';

const stateFromProps = props => ({
  value: JSON.stringify(props.value.toJS(), null, 2),
  error: null
});

export default class JsonTextArea extends Component {
  static propTypes = {
    value: PropTypes.instanceOf(Map), // eslint-disable-line react/no-unused-prop-types
    onChange: PropTypes.func,
    setReviver: PropTypes.func,
  }

  static defaultProps = {
    value: new Map(),
    onChange: () => {}
  }

  constructor(props) {
    super(props);
    this.state = stateFromProps(props);
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState(stateFromProps(nextProps));
  }

  onChange = debounce(immutQuery =>
    this.props.onChange(immutQuery)
  , 620);

  handleChange = (e) => {
    const { setReviver } = this.props;
    const newState = {
      value: e.target.value
    };
    try {
      const newQuery = JSON.parse(newState.value);
      const immutQuery = fromJS(newQuery, setReviver);
      this.onChange(immutQuery);
      newState.error = null;
    } catch (err) {
      newState.error = err;
    }
    this.setState(newState);
  }

  render = () => {
    const { value, error } = this.state;
    const formClasses = classNames({
      'form-group': true,
      'has-error': error
    });

    return (
      <div className={formClasses}>
        <Textarea onChange={this.handleChange} value={value} className="form-control" />
        {error &&
          <span className="help-block">{error.message}</span>
        }
      </div>
    );
  }
}
